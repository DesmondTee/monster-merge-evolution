import { describe, expect, it } from 'vitest'
import { OverflowTracker, Session } from './session'
import { DANGER_Y, DROP_COOLDOWN_MS } from './rules'

describe('overflow countdown and session input', () => {
  it('ends only after three continuous seconds and blocks all later drops', () => {
    const session = new Session()
    session.tick(1, true)
    expect(session.remaining).toBe(3)
    session.tick(999, true)
    expect(session.remaining).toBe(2)
    session.tick(1999, true)
    expect(session.state).toBe('playing')
    expect(session.remaining).toBe(1)
    session.tick(1, true)
    expect(session.state).toBe('over')
    expect(session.drop()).toBe(false)
    session.togglePause()
    session.tick(10000, false)
    expect(session.state).toBe('over')
  })

  it('resets the timer completely when a merge clears overflow', () => {
    const session = new Session()
    session.tick(2900, true)
    session.tick(16, false)
    expect(session.remaining).toBe(0)
    session.tick(2999, true)
    expect(session.state).toBe('playing')
    session.tick(1, true)
    expect(session.state).toBe('over')
  })

  it('freezes overflow and cooldown on pause and resumes both', () => {
    const session = new Session()
    expect(session.drop()).toBe(true)
    session.tick(100, true)
    session.togglePause()
    session.tick(10000, false)
    expect(session.elapsed).toBe(100)
    expect(session.drop()).toBe(false)
    session.togglePause()
    expect(session.drop()).toBe(false)
    session.tick(DROP_COOLDOWN_MS - 100, true)
    expect(session.drop()).toBe(true)
  })

  it('accepts one of a hundred rapid taps and opens exactly at cooldown expiry', () => {
    const session = new Session()
    expect(Array.from({ length: 100 }, () => session.drop()).filter(Boolean)).toHaveLength(1)
    session.tick(DROP_COOLDOWN_MS - 1, false)
    expect(session.drop()).toBe(false)
    session.tick(1, false)
    expect(session.drop()).toBe(true)
  })
})

describe('falling drop immunity', () => {
  it('ignores a newly spawned monster while falling above the danger line', () => {
    const tracker = new OverflowTracker()
    tracker.add(1)
    expect(tracker.above(1, 50, 0, 16)).toBe(false)
    for (let i = 0; i < 20; i++) expect(tracker.above(1, 100, 4, 100)).toBe(false)
  })

  it('detects a drop that lands on a high pile after a short settling period', () => {
    const tracker = new OverflowTracker()
    tracker.add(1)
    expect(tracker.above(1, 100, 4, 400)).toBe(false)
    expect(tracker.above(1, 100, 0.2, 249)).toBe(false)
    expect(tracker.above(1, 100, 0.2, 1)).toBe(true)
    expect(tracker.above(1, 100, 4, 16)).toBe(true)
  })

  it('latches eligibility once below the line, including subsequent bounces', () => {
    const tracker = new OverflowTracker()
    tracker.add(1)
    expect(tracker.above(1, DANGER_Y, 4, 16)).toBe(false)
    expect(tracker.above(1, DANGER_Y - 1, 4, 16)).toBe(true)
    expect(tracker.above(1, DANGER_Y + 1, 0, 16)).toBe(false)
  })

  it('counts evolved bodies immediately and clears all immunity on restart', () => {
    const tracker = new OverflowTracker()
    expect(tracker.above(9, 100, 5, 16)).toBe(true)
    tracker.add(1)
    tracker.remove(1)
    expect(tracker.above(1, 100, 5, 16)).toBe(true)
    tracker.add(2)
    tracker.clear()
    expect(tracker.above(2, 100, 5, 16)).toBe(true)
  })
})

describe('encyclopedia pause ownership', () => {
  it('freezes timing and drops until the encyclopedia closes', () => {
    const session = new Session()
    session.drop()
    session.tick(100, true)
    session.setEncyclopedia(true)
    session.setEncyclopedia(true)
    session.togglePause()
    session.tick(10000, true)
    expect(session.state).toBe('paused')
    expect(session.drop()).toBe(false)
    expect(session.elapsed).toBe(100)
    session.setEncyclopedia(false)
    session.setEncyclopedia(false)
    expect(session.state).toBe('playing')
    expect(session.ready).toBe(false)
    session.tick(DROP_COOLDOWN_MS, false)
    expect(session.ready).toBe(true)
  })

  it('preserves a manual pause and game over after close', () => {
    const session = new Session()
    session.togglePause()
    session.setEncyclopedia(true)
    session.setEncyclopedia(false)
    expect(session.state).toBe('paused')
    session.togglePause()
    session.tick(3000, true)
    session.setEncyclopedia(true)
    session.setEncyclopedia(false)
    expect(session.state).toBe('over')
  })

  it('remains paused if focus is lost while the encyclopedia is open', () => {
    const session = new Session()
    session.setEncyclopedia(true)
    session.pause()
    session.setEncyclopedia(false)
    expect(session.state).toBe('paused')
  })
})
