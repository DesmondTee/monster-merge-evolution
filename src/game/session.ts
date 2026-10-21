import { DANGER_Y, DROP_COOLDOWN_MS } from './rules'

export type PlayState = 'playing' | 'paused' | 'over'
export interface SessionView { state: PlayState; remaining: number; nextLevel: number }
export const OVERFLOW_MS = 3000

export class Session {
  state: PlayState = 'playing'
  elapsed = 0
  private cooldown = 0

  tick(delta: number, overflowing: boolean): void {
    if (this.state !== 'playing') return
    this.cooldown = Math.max(0, this.cooldown - delta)
    this.elapsed = overflowing ? this.elapsed + delta : 0
    if (this.elapsed >= OVERFLOW_MS) this.state = 'over'
  }

  drop(): boolean {
    if (this.state !== 'playing' || this.cooldown > 0) return false
    this.cooldown = DROP_COOLDOWN_MS
    return true
  }

  get ready(): boolean { return this.state === 'playing' && this.cooldown === 0 }
  get remaining(): number { return this.elapsed > 0 ? Math.max(0, Math.ceil((OVERFLOW_MS - this.elapsed) / 1000)) : 0 }
  togglePause(): void {
    if (this.state !== 'over') this.state = this.state === 'paused' ? 'playing' : 'paused'
  }
}

// Falling drops become eligible after passing the line, or resting on a high pile.
// Eligibility stays latched, so bouncing and chain reactions cannot renew immunity.
export class OverflowTracker {
  private falling = new Map<number, { age: number; resting: number }>()
  add(id: number): void { this.falling.set(id, { age: 0, resting: 0 }) }
  remove(id: number): void { this.falling.delete(id) }
  clear(): void { this.falling.clear() }
  above(id: number, top: number, speed: number, delta: number): boolean {
    const drop = this.falling.get(id)
    if (drop) {
      drop.age += delta
      drop.resting = speed < 1 ? drop.resting + delta : 0
      if (top >= DANGER_Y || (drop.age >= 350 && drop.resting >= 250)) this.falling.delete(id)
      else return false
    }
    return top < DANGER_Y
  }
}
