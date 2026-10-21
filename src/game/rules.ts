export const GAME = { width: 360, height: 640 } as const
export const CONTAINER = { left: 26, right: 334, floor: 600 } as const
export const DROP_Y = 76
export const DANGER_Y = 142
export const DROP_COOLDOWN_MS = 300
export const MAX_MONSTERS = 100

export function clampDropX(x: number, radius: number): number {
  return Math.max(CONTAINER.left + radius, Math.min(CONTAINER.right - radius, x))
}
