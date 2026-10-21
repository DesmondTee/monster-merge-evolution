import { describe, expect, it } from 'vitest'
import { MONSTERS } from './monsters'
import { CONTAINER, clampDropX } from './rules'

describe('drop containment', () => {
  for (const monster of MONSTERS) {
    it(`keeps the complete ${monster.name} body between both walls`, () => {
      expect(clampDropX(-1000, monster.radius) - monster.radius).toBe(CONTAINER.left)
      expect(clampDropX(1000, monster.radius) + monster.radius).toBe(CONTAINER.right)
      expect(clampDropX(180, monster.radius)).toBe(180)
    })
  }
})
