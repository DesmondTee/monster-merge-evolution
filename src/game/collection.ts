import { MONSTERS } from './monsters'

export const COLLECTION_KEY = 'monster-merge-evolution.collection'
export const ACHIEVEMENTS = [
  { id: 'first-evolution', name: 'First Evolution', description: 'Merge your first pair of monsters.' },
  { id: 'five-monsters', name: 'Discover 5 Monsters', description: 'Meet five different creatures.' },
  { id: 'complete', name: 'Complete the Encyclopedia', description: 'Meet all ten creatures.' },
] as const
type Achievement = typeof ACHIEVEMENTS[number]['id']
export interface CollectionSave { version: 1; discovered: string[]; achievements: Achievement[] }
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>
export const emptyCollection = (): CollectionSave => ({ version: 1, discovered: [], achievements: [] })

function award(save: CollectionSave): CollectionSave {
  const achievements = new Set(save.achievements)
  if (save.discovered.length >= 5) achievements.add('five-monsters')
  if (save.discovered.length === MONSTERS.length) achievements.add('complete')
  return { ...save, achievements: [...achievements] }
}

export function loadCollection(storage: Storage): CollectionSave {
  try {
    const value: unknown = JSON.parse(storage.getItem(COLLECTION_KEY) ?? 'null')
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
      !('discovered' in value) || !Array.isArray(value.discovered) ||
      !('achievements' in value) || !Array.isArray(value.achievements)) return emptyCollection()
    const keys = value.discovered
    const discovered = MONSTERS.filter((monster) => keys.includes(monster.key)).map((monster) => monster.key)
    // Threshold achievements are derived from validated discoveries; only the merge fact is stored independently.
    return award({ version: 1, discovered, achievements: value.achievements.includes('first-evolution') ? ['first-evolution'] : [] })
  } catch { return emptyCollection() }
}

export function saveCollection(storage: Storage, save: CollectionSave): boolean {
  try { storage.setItem(COLLECTION_KEY, JSON.stringify(save)); return true } catch { return false }
}

export function discover(save: CollectionSave, level: number, source: 'drop' | 'merge') {
  const monster = MONSTERS[level]
  if (!monster) return { save, unlocked: false }
  const unlocked = !save.discovered.includes(monster.key)
  const firstMerge = source === 'merge' && !save.achievements.includes('first-evolution')
  if (!unlocked && !firstMerge) return { save, unlocked: false }
  return {
    unlocked,
    save: award({ version: 1,
      discovered: unlocked ? [...save.discovered, monster.key] : save.discovered,
      achievements: firstMerge ? [...save.achievements, 'first-evolution'] : save.achievements,
    }),
  }
}
