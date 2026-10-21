import { MONSTERS } from './monsters'

export const COLLECTION_KEY = 'monster-merge-evolution.collection'
export const ACHIEVEMENTS = [
  { id: 'first-evolution', name: 'First Evolution', description: 'Merge your first pair of monsters.' },
  { id: 'five-monsters', name: 'Discover 5 Monsters', description: 'Meet five different creatures.' },
  { id: 'complete', name: 'Complete the Encyclopedia', description: 'Meet all ten creatures.' },
] as const
type Achievement = typeof ACHIEVEMENTS[number]['id']
export interface CollectionSave { version: 2; discovered: string[]; rareDiscovered: string[]; achievements: Achievement[] }
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>
export const emptyCollection = (): CollectionSave => ({ version: 2, discovered: [], rareDiscovered: [], achievements: [] })

function award(save: CollectionSave): CollectionSave {
  const achievements = new Set(save.achievements)
  const species = new Set([...save.discovered, ...save.rareDiscovered]).size
  if (species >= 5) achievements.add('five-monsters')
  if (species === MONSTERS.length) achievements.add('complete')
  return { ...save, achievements: [...achievements] }
}

export function loadCollection(storage: Storage): CollectionSave {
  try {
    const value: unknown = JSON.parse(storage.getItem(COLLECTION_KEY) ?? 'null')
    if (!value || typeof value !== 'object' || !('version' in value) || (value.version !== 1 && value.version !== 2)) return emptyCollection()
    const validKeys = (keys: unknown): string[] => MONSTERS.filter((monster) => Array.isArray(keys) && keys.includes(monster.key)).map((monster) => monster.key)
    const discovered = validKeys('discovered' in value ? value.discovered : [])
    const rareDiscovered = validKeys(value.version === 2 && 'rareDiscovered' in value ? value.rareDiscovered : [])
    const stored = 'achievements' in value && Array.isArray(value.achievements) ? value.achievements : []
    // Preserve every previously earned valid achievement, even if another field is damaged.
    const achievements = ACHIEVEMENTS.filter((entry) => stored.includes(entry.id)).map((entry) => entry.id)
    return award({ version: 2, discovered, rareDiscovered, achievements })
  } catch { return emptyCollection() }
}

export function saveCollection(storage: Storage, save: CollectionSave): boolean {
  try { storage.setItem(COLLECTION_KEY, JSON.stringify(save)); return true } catch { return false }
}

export function discover(save: CollectionSave, level: number, source: 'drop' | 'merge', rare = false) {
  const monster = MONSTERS[level]
  if (!monster) return { save, unlocked: false }
  const field = rare ? 'rareDiscovered' : 'discovered'
  const unlocked = !save[field].includes(monster.key)
  const firstMerge = source === 'merge' && !save.achievements.includes('first-evolution')
  if (!unlocked && !firstMerge) return { save, unlocked: false }
  return {
    unlocked,
    save: award({ ...save,
      [field]: unlocked ? [...save[field], monster.key] : save[field],
      achievements: firstMerge ? [...save.achievements, 'first-evolution'] : save.achievements,
    }),
  }
}
