import type Phaser from 'phaser'

export function evolutionEffect(scene: Phaser.Scene, x: number, y: number, color: number, points: number): void {
  // At most six active bursts; each has eight squares and one label.
  if (scene.children.list.filter((child) => child.name === 'evolution-score').length >= 6) return
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4
    const pixel = scene.add.rectangle(x, y, 4, 4, color).setDepth(10)
    scene.tweens.add({ targets: pixel, x: x + Math.cos(angle) * 32, y: y + Math.sin(angle) * 32,
      alpha: 0, duration: 320, onComplete: () => pixel.destroy() })
  }
  const label = scene.add.text(x, y - 12, `+${points}`, {
    fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#fff3ce', stroke: '#182e38', strokeThickness: 3,
  }).setOrigin(0.5).setDepth(11).setName('evolution-score')
  scene.tweens.add({ targets: label, y: y - 55, alpha: 0, duration: 650, onComplete: () => label.destroy() })
}
