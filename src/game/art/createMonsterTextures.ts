import type Phaser from 'phaser'
import { MONSTERS } from '../monsters'

// Original 16×16 pixel silhouettes rendered at 3× with nearest-neighbor scaling.
const SILHOUETTES = [
  ['     xx  xx     ', '     xx  xx     ', '    xxxxxxxx    ', '   xxxxxxxxxx   ', '  xxxxxxxxxxxx  ', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', '  xxxxxxxxxxxx  ', '  xxxxxxxxxxxx  ', '   xxxxxxxxxx   ', '    xxxxxxxx    ', '    xxx  xxx    ', '                '],
  ['   xx      xx   ', '   xxx    xxx   ', '   xxxxxxxxxx   ', '  xxxxxxxxxxxx  ', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', '  xxxxxxxxxxxx  ', '   xxxxxxxxxx   ', '    xxx  xxx    ', '                '],
  ['      xxxx      ', '     xxxxxx     ', '    xxxxxxxx    ', '   xxxxxxxxxx   ', '  xxxxxxxxxxxx  ', ' xxxxxxxxxxxxxx ', ' xxxxxxxxxxxxxx ', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', ' xxxxxxxxxxxxxx ', '  xxxxxxxxxxxx  ', '   xxxxxxxxxx   ', '    xxxxxxxx    ', '    xxx  xxx    ', '                '],
] as const

export function createMonsterTextures(scene: Phaser.Scene): void {
  MONSTERS.forEach((monster, index) => {
    if (scene.textures.exists(monster.key)) return
    const graphics = scene.make.graphics({ x: 0, y: 0 })
    SILHOUETTES[index]!.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel !== 'x') return
        graphics.fillStyle(y > 10 ? monster.shade : monster.color)
        graphics.fillRect(x * 3, y * 3, 3, 3)
      })
    })
    graphics.fillStyle(monster.accent).fillRect(12, 12, 6, 3)
    graphics.fillStyle(0x253446).fillRect(12, 21, 6, 6).fillRect(30, 21, 6, 6).fillRect(21, 33, 6, 3)
    graphics.fillStyle(0xffffff).fillRect(12, 21, 3, 3).fillRect(30, 21, 3, 3)
    graphics.generateTexture(monster.key, 48, 48)
    graphics.destroy()
  })
}
