import type Phaser from 'phaser'
import { MONSTERS } from '../monsters'
import { monsterPixels } from './monsterPixels'

export function createMonsterTextures(scene: Phaser.Scene): void {
  MONSTERS.forEach((monster, level) => {
    if (scene.textures.exists(monster.key)) return
    const graphics = scene.make.graphics({ x: 0, y: 0 })
    const colors = [0, monster.color, monster.shade, monster.accent, 0x253446, 0xffffff]
    monsterPixels(level).forEach((row, y) => row.forEach((pixel, x) => {
      if (pixel === 0) return
      graphics.fillStyle(colors[pixel]!).fillRect(x * 2, y * 2, 2, 2)
    }))
    graphics.generateTexture(monster.key, 48, 48)
    graphics.destroy()
  })
}
