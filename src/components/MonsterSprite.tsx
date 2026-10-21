import { MONSTERS } from '../game/monsters'
import { monsterPixels } from '../game/art/monsterPixels'
import { monsterPalette } from '../game/variants'

// Build once from the very same pixel matrix and palette used by Phaser.
const sprites = MONSTERS.map((_, level) => {
  const make = (locked: boolean, rare = false) => {
    const colors = monsterPalette(level, rare)
    const rects = monsterPixels(level).flatMap((row, y) => row.map((pixel, x) => pixel ?
      `<rect x="${x}" y="${y}" width="1" height="1" fill="${locked ? '#53656a' : `#${Number(colors[pixel]).toString(16).padStart(6, '0')}`}"/>` : '')).join('')
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">${rects}</svg>`)}`
  }
  return { normal: make(false), rare: make(false, true), locked: make(true) }
})

export function MonsterSprite({ level, locked = false, rare = false }: { level: number; locked?: boolean; rare?: boolean }) {
  return <img className={`monster-sprite${rare && !locked ? ' rare-sprite' : ''}`} width="72" height="72" src={sprites[level]![locked ? 'locked' : rare ? 'rare' : 'normal']} alt={locked ? 'Undiscovered monster silhouette' : `${rare ? 'Rare · ' : ''}${MONSTERS[level]!.visual}`} />
}
