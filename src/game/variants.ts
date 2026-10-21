import { MONSTERS } from './monsters'

// Balance knob: probability per accepted player drop, never per merge or preview.
export const RARE_DROP_CHANCE = 0.02

export function rollRare(chance = RARE_DROP_CHANCE, random: () => number = Math.random): boolean {
  if (!Number.isFinite(chance) || chance < 0 || chance > 1) throw new RangeError('Rare chance must be between 0 and 1')
  return random() < chance
}

// Original alternate palettes: body, shadow, highlight. Geometry is shared.
export const RARE_PALETTES = [
  [0xf3a6cf, 0xa95796, 0xffe6a8], // rose shoots
  [0x88dfd1, 0x388c9c, 0xe6ffb0], // mint ember
  [0xe8bc76, 0xb87b56, 0xfff0ca], // honey droplets
  [0xb5a2ee, 0x71639f, 0xe8e2ff], // amethyst stone
  [0xa6e1ab, 0x4c9989, 0xfaffbe], // lime petals
  [0x9cbfff, 0x606bba, 0xf5d9ff], // blue lightning
  [0x83d6b4, 0x368d89, 0xe0ffcb], // sea-glass coral
  [0xf5a8c7, 0xb9609b, 0xffead9], // blush crystal
  [0xf2be74, 0xb17562, 0xffedb2], // sunset dusk
  [0xb3c7f6, 0x727eb4, 0xf3e4ff], // moonlit armor
] as const

export const monsterTexture = (level: number, rare = false) => `${MONSTERS[level]!.key}${rare ? '-rare' : ''}`
export function monsterPalette(level: number, rare = false): readonly number[] {
  const monster = MONSTERS[level]!
  return [0, ...(rare ? RARE_PALETTES[level]! : [monster.color, monster.shade, monster.accent]), 0x253446, 0xffffff]
}
