import { describe, expect, it } from 'vitest'
import { canMerge, MergeQueue, mergePoints } from './merging'
import { DROP_LEVELS, MONSTERS } from './monsters'
import { monsterPixels } from './art/monsterPixels'

describe('evolution catalogue', () => {
  it('has ten distinct names, colors, keys and increasing sizes', () => {
    expect(MONSTERS).toHaveLength(10)
    for (const field of ['name', 'key', 'color', 'radius'] as const) {
      expect(new Set(MONSTERS.map((monster) => monster[field])).size).toBe(10)
    }
    for (let i = 1; i < MONSTERS.length; i++) expect(MONSTERS[i]!.radius).toBeGreaterThan(MONSTERS[i - 1]!.radius)
    expect(DROP_LEVELS).toEqual([0, 1, 2])
  })

  it('generates ten distinct silhouettes and deterministic bounded pixel art', () => {
    const sprites = MONSTERS.map((_, level) => monsterPixels(level))
    expect(new Set(sprites.map((pixels) => JSON.stringify(pixels.map((row) => row.map(Boolean))))).size).toBe(10)
    sprites.forEach((pixels, level) => {
      expect(pixels).toEqual(monsterPixels(level))
      expect(pixels).toHaveLength(24)
      pixels.forEach((row) => {
        expect(row).toHaveLength(24)
        expect(row.every((value) => Number.isInteger(value) && value >= 0 && value <= 5)).toBe(true)
      })
    })
  })
})

describe('merging and scoring rules', () => {
  it('only allows matching, non-terminal valid levels', () => {
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) expect(canMerge(a, b)).toBe(a === b && a < 9)
    for (const level of [-1, 0.5, 10, NaN, Infinity]) {
      expect(canMerge(level, level)).toBe(false)
      expect(mergePoints(level)).toBe(0)
    }
  })

  it('awards exponentially increasing points through the final evolution', () => {
    expect(Array.from({ length: 10 }, (_, level) => mergePoints(level))).toEqual([10, 20, 40, 80, 160, 320, 640, 1280, 2560, 0])
  })

  it('rejects walls, unknown bodies, self collisions, mismatches and final-level pairs', () => {
    const queue = new MergeQueue()
    queue.register(1, 0)
    queue.register(2, 1)
    queue.register(3, 9)
    queue.register(4, 9)
    for (const [a, b] of [[1, 999], [1, 1], [1, 2], [3, 4]] as const) queue.queue(a, b)
    expect(queue.drain()).toEqual([])
  })

  it('consumes each body once across rapid reversed and shared collisions', () => {
    const queue = new MergeQueue()
    for (let id = 1; id <= 4; id++) queue.register(id, 0)
    for (let repeat = 0; repeat < 100; repeat++) {
      queue.queue(1, 2)
      queue.queue(2, 1)
      queue.queue(2, 3)
      queue.queue(3, 4)
    }
    expect(queue.drain()).toEqual([
      { first: 1, second: 2, level: 1, points: 10 },
      { first: 3, second: 4, level: 1, points: 10 },
    ])
    queue.queue(1, 2)
    expect(queue.drain()).toEqual([])
  })

  it('supports newborns chaining on later steps while rejecting stale contacts', () => {
    const queue = new MergeQueue()
    queue.register(1, 0)
    queue.register(2, 0)
    queue.register(3, 1)
    queue.register(4, 2)
    let score = 0
    for (const [first, second, newborn] of [[1, 2, 5], [5, 3, 6], [6, 4, 7]] as const) {
      queue.queue(first, second)
      queue.queue(second, first)
      const plans = queue.drain()
      expect(plans).toHaveLength(1)
      score += plans[0]!.points
      queue.register(newborn, plans[0]!.level)
      queue.queue(first, second)
      expect(queue.drain()).toEqual([])
    }
    expect(score).toBe(70)
    expect(queue.drain()).toEqual([])
  })
})
