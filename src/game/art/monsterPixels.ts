// Original symmetric 24×24 designs generated from geometry and tier markings.
// Pixel values: body, shadow, accent, ink, white.
export function monsterPixels(level: number): number[][] {
  const pixels = Array.from({ length: 24 }, () => Array<number>(24).fill(0))
  const put = (x: number, y: number, color: number) => {
    if (x >= 0 && x < 24 && y >= 0 && y < 24) pixels[y]![x] = color
  }
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 24; x++) {
      const dx = Math.abs(x - 11.5), dy = y - 12
      const body = dx * dx / (level === 3 ? 94 : level === 7 ? 49 : level === 8 ? 60 : 81) + dy * dy / (level >= 7 ? 81 : 64) < 1
      let feature = false
      switch (level) {
        case 0: feature = y >= 2 && y <= 6 && dx >= 2 && dx <= 4; break // shoots
        case 1: feature = y >= 2 && y <= 8 && dx >= 7 - y / 3 && dx <= 7; break // ears
        case 2: feature = y >= 1 && y <= 6 && dx < y / 2; break // water crest
        case 3: feature = y >= 7 && y <= 17 && dx < 11 && (Math.floor(dx) + y) % 3 !== 0; break // crags
        case 4: feature = dx >= 6 && dx <= 11 && ((y >= 4 && y <= 10 && dx + Math.abs(y - 7) < 14) || (y >= 13 && y <= 19 && dx + Math.abs(y - 16) < 13)); break // split petal wings
        case 5: feature = y <= 8 && y >= 1 && dx >= 4 && dx <= 9 && (y < 4 ? dx < 6 : y < 6 ? dx > 6 : dx < 8); break // forked lightning horns
        case 6: feature = y >= 1 && y <= 9 && ((dx >= 6 && dx <= 8) || (y >= 4 && y <= 5 && dx >= 8 && dx <= 11) || (y <= 3 && dx >= 9 && dx <= 10)); break // branching coral antlers
        case 7: feature = (dx >= 6 && dx + Math.abs(y - 11) < 15 && y >= 5 && y <= 17) || (y >= 19 && y <= 22 && dx < (y - 17) * 1.4); break // crystal fins + forked tail
        case 8: feature = (y >= 1 && y <= 9 && dx >= 4 + y / 3 && dx < 11 - y / 4) || (dx >= 7 && dx <= 10 && y >= 13 && y <= 18 && (y + Math.floor(dx)) % 4 !== 0); break // sweeping horns + dusk wings
        case 9: feature = (y >= 1 && y <= 7 && dx <= 8 && (y >= 5 || dx < 2 || (dx > 4 && dx < 7))) || (dx >= 8 && dx <= 11 && y >= 8 && y <= 18); break // three-point crown + shoulder armor
      }
      if (body || feature) put(x, y, y > 15 || (feature && level >= 4) ? 2 : 1)
      if (body && y < 11 && (x + y + level) % (level + 4) === 0) put(x, y, 3)
      if (feature && level >= 4 && (y % 4 === 1 || dx > 9)) put(x, y, 3)
      if (body && level === 9 && y >= 17 && (x + y) % 4 === 0) put(x, y, 3)
    }
  }
  for (const x of [7, 15]) {
    for (let y = 11; y < 14; y++) for (let dx = 0; dx < 2; dx++) put(x + dx, y, 4)
    put(x, 11, 5)
  }
  for (let x = 10; x < 14; x++) put(x, 16, 4)
  for (const x of [7, 8, 15, 16]) put(x, 20, 2)
  if (level >= 5) for (let x = 10; x < 14; x++) put(x, 18, 3)
  return pixels
}
