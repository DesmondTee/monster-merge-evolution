import type Phaser from 'phaser'
import { MONSTERS } from '../monsters'
import { monsterPixels } from './monsterPixels'
import { monsterPalette, monsterTexture } from '../variants'

export function createMonsterTextures(scene: Phaser.Scene): void {
  MONSTERS.forEach((_, level) => {
    for (const rare of [false, true]) {
      const key = monsterTexture(level, rare)
      if (scene.textures.exists(key)) continue
      const graphics = scene.make.graphics({ x: 0, y: 0 })
      const colors = monsterPalette(level, rare)
      monsterPixels(level).forEach((row, y) => row.forEach((pixel, x) => {
        if (pixel === 0) return
        graphics.fillStyle(colors[pixel]!).fillRect(x * 2, y * 2, 2, 2)
      }))
      graphics.generateTexture(key, 48, 48)
      graphics.destroy()
    }
  })
}
