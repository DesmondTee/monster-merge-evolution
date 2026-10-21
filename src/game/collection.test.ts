import { describe, expect, it, vi } from 'vitest'
import { ACHIEVEMENTS, COLLECTION_KEY, discover, emptyCollection, loadCollection, saveCollection } from './collection'
import { MONSTERS } from './monsters'
import { Session } from './session'
import { BEST_SCORE_KEY, loadBestScore } from './scoring'
import { GameBridge } from './events'

function storage(raw: string | null = null) {
  const values = new Map<string, string>(raw === null ? [] : [[COLLECTION_KEY, raw]])
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
}

describe('persistent collection', () => {
  it('starts empty and unlocks only a valid first appearance', () => {
    const initial = emptyCollection()
    expect(loadCollection(storage())).toEqual(initial)
    const result = discover(initial, 0, 'drop')
    expect(result.unlocked).toBe(true)
    expect(result.save.discovered).toEqual(['sprout'])
    expect(result.save.achievements).toEqual([])
    expect(initial.discovered).toEqual([])
    for (const level of [-1, 10, 1.5, NaN]) expect(discover(initial, level, 'merge').save).toBe(initial)
  })

  it('prevents duplicate unlocks and preserves identity for unchanged state', () => {
    const first = discover(emptyCollection(), 0, 'drop')
    for (let i = 0; i < 10; i++) expect(discover(first.save, 0, 'drop')).toEqual({ save: first.save, unlocked: false })
    expect(discover(first.save, 0, 'drop').save).toBe(first.save)
  })

  it('awards First Evolution for an actual merge even when its monster is already known', () => {
    const dropped = discover(emptyCollection(), 1, 'drop').save
    const merged = discover(dropped, 1, 'merge')
    expect(merged.unlocked).toBe(false)
    expect(merged.save.achievements).toEqual(['first-evolution'])
    expect(discover(merged.save, 1, 'merge').save).toBe(merged.save)
  })

  it('tracks progress and awards threshold achievements exactly once', () => {
    let save = emptyCollection()
    MONSTERS.forEach((_, level) => {
      save = discover(save, level, level === 0 ? 'drop' : 'merge').save
      expect(save.discovered.length).toBe(level + 1)
      expect(save.achievements.includes('five-monsters')).toBe(level >= 4)
      expect(save.achievements.includes('complete')).toBe(level === 9)
    })
    expect(new Set(save.achievements)).toEqual(new Set(ACHIEVEMENTS.map((a) => a.id)))
  })

  it('saves versioned stable keys and loads discoveries and achievements', () => {
    const store = storage()
    const save = discover(discover(emptyCollection(), 0, 'drop').save, 1, 'merge').save
    expect(saveCollection(store, save)).toBe(true)
    expect(JSON.parse(store.getItem(COLLECTION_KEY)!)).toEqual(save)
    expect(loadCollection(store)).toEqual(save)
  })

  it.each(['{broken', 'null', '42', '[]', '{}', '{"version":99,"discovered":["sprout"],"achievements":[]}', '{"version":1,"discovered":"all","achievements":[]}', '{"version":1,"discovered":[],"achievements":null}'])('recovers from malformed or unsupported data: %s', (raw) => {
    expect(loadCollection(storage(raw))).toEqual(emptyCollection())
  })

  it('filters unknown and duplicate keys and preserves earned achievements', () => {
    const raw = JSON.stringify({ version: 1, discovered: ['sprout', 'sprout', 'unknown', null, 1], achievements: ['complete', 'five-monsters', 'first-evolution', 'first-evolution', 'unknown'] })
    expect(loadCollection(storage(raw))).toEqual({ version: 2, discovered: ['sprout'], rareDiscovered: [], achievements: ['first-evolution', 'five-monsters', 'complete'] })
    const all = loadCollection(storage(JSON.stringify({ version: 1, discovered: MONSTERS.map((m) => m.key), achievements: [] })))
    expect(all.achievements).toEqual(['five-monsters', 'complete'])
  })

  it('tolerates denied reads, denied writes and exhausted storage', () => {
    const store = { getItem: vi.fn(() => { throw Error('denied') }), setItem: vi.fn(() => { throw Error('quota') }) }
    expect(loadCollection(store)).toEqual(emptyCollection())
    expect(saveCollection(store, emptyCollection())).toBe(false)
  })

  it('keeps collection and achievements across game over, restart and reload', () => {
    const store = storage()
    const save = discover(emptyCollection(), 1, 'merge').save
    saveCollection(store, save)
    const session = new Session()
    session.tick(3000, true)
    expect(session.state).toBe('over')
    const restarted = new Session()
    expect(restarted.state).toBe('playing')
    expect(loadCollection(store)).toEqual(save)
    expect(discover(loadCollection(store), 1, 'merge').unlocked).toBe(false)
  })
})

describe('rare collection migration and persistence', () => {
  it('migrates the full v1 journal without losing any normal discoveries, achievements or best score', () => {
    const old = { version: 1, discovered: MONSTERS.map((m) => m.key), achievements: ACHIEVEMENTS.map((a) => a.id) }
    const store = storage(JSON.stringify(old))
    store.setItem(BEST_SCORE_KEY, '4560')
    const migrated = loadCollection(store)
    expect(migrated).toEqual({ ...old, version: 2, rareDiscovered: [] })
    expect(saveCollection(store, migrated)).toBe(true)
    expect(loadCollection(store)).toEqual(migrated)
    expect(loadBestScore(store)).toBe(4560)
  })

  it.each([undefined, null, 'all', 42, {}, ['sprout', 'sprout', 'unknown', null, 1]])('recovers damaged rare data independently: %s', (rareDiscovered) => {
    const store = storage(JSON.stringify({ version: 2, discovered: ['ember'], achievements: ['first-evolution'], rareDiscovered }))
    const save = loadCollection(store)
    expect(save.discovered).toEqual(['ember'])
    expect(save.achievements).toEqual(['first-evolution'])
    expect(save.rareDiscovered).toEqual(Array.isArray(rareDiscovered) ? ['sprout'] : [])
  })

  it('preserves discoveries when the old achievement field is damaged', () => {
    expect(loadCollection(storage(JSON.stringify({ version: 1, discovered: ['sprout'], achievements: null })))).toEqual({
      version: 2, discovered: ['sprout'], rareDiscovered: [], achievements: [],
    })
  })

  it('tracks both palettes separately while counting species once for existing achievements', () => {
    let save = emptyCollection()
    for (let level = 0; level < 4; level++) {
      save = discover(save, level, 'drop').save
      save = discover(save, level, 'drop', true).save
    }
    expect(save.achievements).toEqual([])
    save = discover(save, 4, 'merge', true).save
    expect(save.achievements).toEqual(['first-evolution', 'five-monsters'])
    for (let level = 5; level < 10; level++) save = discover(save, level, 'merge', true).save
    expect(save.discovered).toHaveLength(4)
    expect(save.rareDiscovered).toHaveLength(10)
    expect(save.achievements).toContain('complete')
  })

  it('deduplicates rapid bridge events per palette and preserves notification order through chain reactions', () => {
    const bridge = new GameBridge()
    let save = emptyCollection()
    const notices: { level: number; rare: boolean }[] = []
    bridge.on('appeared', ({ level, source, rare }) => {
      const result = discover(save, level, source, rare)
      save = result.save
      if (result.unlocked) notices.push({ level, rare })
    })
    for (let level = 0; level < 10; level++) {
      for (let repeat = 0; repeat < 100; repeat++) {
        bridge.emit('appeared', { level, source: 'merge', rare: true })
        bridge.emit('appeared', { level, source: 'merge', rare: false })
      }
    }
    expect(notices).toEqual(MONSTERS.flatMap((_, level) => [{ level, rare: true }, { level, rare: false }]))
    expect(save.rareDiscovered).toHaveLength(10)
    expect(save.discovered).toHaveLength(10)
    expect(save.achievements).toHaveLength(3)
  })

  it('retains rare discoveries, achievements and best score through restart and repeated refreshes', () => {
    const store = storage()
    let save = discover(discover(emptyCollection(), 1, 'drop').save, 1, 'merge', true).save
    store.setItem(BEST_SCORE_KEY, '1000')
    for (let run = 0; run < 3; run++) {
      saveCollection(store, save)
      const session = new Session()
      session.tick(3000, true)
      expect(session.state).toBe('over')
      expect(new Session().state).toBe('playing')
      save = loadCollection(store)
      expect(save.rareDiscovered).toEqual(['ember'])
      expect(save.discovered).toEqual(['ember'])
      expect(save.achievements).toEqual(['first-evolution'])
      expect(discover(save, 1, 'merge', true)).toEqual({ save, unlocked: false })
      expect(loadBestScore(store)).toBe(1000)
    }
  })
})
