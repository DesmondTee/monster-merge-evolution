import { describe, expect, it, vi } from 'vitest'
import { RARE_DROP_CHANCE, rollRare, monsterPalette, monsterTexture } from './variants'
import { MONSTERS } from './monsters'
import { MergeQueue } from './merging'

describe('rare balancing and original palettes', () => {
  it('defaults to exactly 2 percent and supports deterministic balancing', () => {
    expect(RARE_DROP_CHANCE).toBe(0.02)
    expect(rollRare(undefined, () => 0.019999)).toBe(true)
    expect(rollRare(undefined, () => 0.02)).toBe(false)
    const random = vi.fn()
    for (const chance of [0, 0.02, 0.25, 1]) {
      let rare = 0
      for (let i = 0; i < 10000; i++) {
        random.mockReturnValue(i / 10000)
        if (rollRare(chance, random)) rare++
      }
      expect(rare).toBe(chance * 10000)
    }
    expect(random).toHaveBeenCalledTimes(40000)
  })

  it.each([-1, 1.01, NaN, Infinity])('rejects invalid probability %s', (chance) => {
    expect(() => rollRare(chance)).toThrow(RangeError)
  })

  it('provides ten alternate palettes and distinct texture keys with shared ink and white', () => {
    expect(new Set(MONSTERS.map((_, level) => monsterPalette(level, true).join(','))).size).toBe(10)
    MONSTERS.forEach((monster, level) => {
      const normal = monsterPalette(level)
      const rare = monsterPalette(level, true)
      expect(normal.slice(1, 4)).toEqual([monster.color, monster.shade, monster.accent])
      expect(rare.slice(1, 4).every((color, i) => color !== normal[i + 1])).toBe(true)
      expect(rare.slice(4)).toEqual(normal.slice(4))
      expect(monsterTexture(level, true)).not.toBe(monsterTexture(level))
    })
  })
})

describe('variant merge inheritance', () => {
  it.each([[false, false], [false, true], [true, false], [true, true]])('merges parent variants %s / %s at every nonterminal level', (first, second) => {
    for (let level = 0; level < 9; level++) {
      const queue = new MergeQueue()
      queue.register(1, level, first)
      queue.register(2, level, second)
      queue.queue(1, 2)
      queue.queue(2, 1)
      expect(queue.drain()).toEqual([{ first: 1, second: 2, level: level + 1, points: 10 * 2 ** level, rare: first || second }])
      queue.queue(1, 2)
      expect(queue.drain()).toEqual([])
    }
  })

  it('keeps rare inheritance through multiple generations with normal partners', () => {
    const queue = new MergeQueue()
    queue.register(1, 0, true)
    let parent = 1
    for (let level = 0; level < 9; level++) {
      const partner = 10 + level, newborn = 100 + level
      queue.register(partner, level)
      queue.queue(parent, partner)
      const plan = queue.drain()[0]!
      expect(plan.rare).toBe(true)
      queue.register(newborn, plan.level, plan.rare)
      parent = newborn
    }
    queue.register(999, 9)
    queue.queue(parent, 999)
    expect(queue.drain()).toEqual([])
  })
})
