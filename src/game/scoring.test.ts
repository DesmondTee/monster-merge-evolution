import { describe, expect, it } from 'vitest'
import { BEST_SCORE_KEY, loadBestScore, saveBestScore } from './scoring'

describe('best score persistence', () => {
  it('persists a record across sessions and never lowers it on reset', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    expect(loadBestScore(storage)).toBe(0)
    saveBestScore(storage, 70)
    expect(values.get(BEST_SCORE_KEY)).toBe('70')
    saveBestScore(storage, 0)
    expect(loadBestScore(storage)).toBe(70)
    saveBestScore(storage, 150)
    expect(loadBestScore(storage)).toBe(150)
  })

  it('recovers from malformed values and unavailable storage', () => {
    for (const value of ['garbage', '-10', 'Infinity', '1.5', '9007199254740992']) {
      expect(loadBestScore({ getItem: () => value, setItem: () => {} })).toBe(0)
    }
    const blocked = { getItem: (): string | null => { throw new Error('blocked') }, setItem: () => { throw new Error('quota') } }
    expect(loadBestScore(blocked)).toBe(0)
    expect(() => saveBestScore(blocked, 20)).not.toThrow()
  })
})
