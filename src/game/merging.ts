import { MONSTERS } from './monsters'

export function mergePoints(level: number): number {
  return Number.isInteger(level) && level >= 0 && level < MONSTERS.length - 1
    ? 10 * 2 ** level : 0
}

export function canMerge(a: number, b: number): boolean {
  return a === b && mergePoints(a) > 0
}

export interface MergePlan { first: number; second: number; level: number; points: number; rare: boolean }

// Reserve bodies immediately; the scene mutates Matter after its update.
// Reversed, stale, and shared-body pairs cannot consume a creature twice.
export class MergeQueue {
  private levels = new Map<number, number>()
  private rares = new Set<number>()
  private reserved = new Set<number>()
  private pending: MergePlan[] = []

  register(id: number, level: number, rare = false): void {
    this.levels.set(id, level)
    if (rare) this.rares.add(id)
    else this.rares.delete(id)
  }

  queue(first: number, second: number): void {
    if (first === second || this.reserved.has(first) || this.reserved.has(second)) return
    const a = this.levels.get(first)
    const b = this.levels.get(second)
    if (a === undefined || b === undefined || !canMerge(a, b)) return
    this.reserved.add(first)
    this.reserved.add(second)
    this.pending.push({ first, second, level: a + 1, points: mergePoints(a), rare: this.rares.has(first) || this.rares.has(second) })
  }

  drain(): MergePlan[] {
    const plans = this.pending
    this.pending = []
    for (const { first, second } of plans) {
      this.levels.delete(first)
      this.levels.delete(second)
      this.rares.delete(first)
      this.rares.delete(second)
    }
    this.reserved.clear()
    return plans
  }
}
