import { describe, expect, it, vi } from 'vitest'
import { ACHIEVEMENTS, COLLECTION_KEY, discover, emptyCollection, loadCollection, saveCollection } from './collection'
import { MONSTERS } from './monsters'
import { Session } from './session'

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

  it.each(['{broken', 'null', '42', '[]', '{}', '{"version":2,"discovered":["sprout"],"achievements":[]}', '{"version":1,"discovered":"all","achievements":[]}', '{"version":1,"discovered":[],"achievements":null}'])('recovers from malformed or unsupported data: %s', (raw) => {
    expect(loadCollection(storage(raw))).toEqual(emptyCollection())
  })

  it('filters unknown and duplicate keys and recalculates threshold achievements', () => {
    const raw = JSON.stringify({ version: 1, discovered: ['sprout', 'sprout', 'unknown', null, 1], achievements: ['complete', 'five-monsters', 'first-evolution', 'first-evolution', 'unknown'] })
    expect(loadCollection(storage(raw))).toEqual({ version: 1, discovered: ['sprout'], achievements: ['first-evolution'] })
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
