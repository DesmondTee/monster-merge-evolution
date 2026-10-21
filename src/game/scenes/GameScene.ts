import Phaser from 'phaser'
import { createMonsterTextures } from '../art/createMonsterTextures'
import { MONSTERS } from '../monsters'
import type { MonsterDefinition } from '../monsters'
import { CONTAINER, DANGER_Y, DROP_COOLDOWN_MS, DROP_Y, GAME, MAX_MONSTERS, clampDropX } from '../rules'

export class GameScene extends Phaser.Scene {
  private nextMonster: MonsterDefinition = MONSTERS[0]
  private preview!: Phaser.GameObjects.Image
  private guide!: Phaser.GameObjects.Graphics
  private status!: Phaser.GameObjects.Text
  private nextDropAt = 0
  private count = 0

  constructor() { super('GameScene') }

  create(): void {
    this.count = 0
    this.nextDropAt = 0
    this.nextMonster = MONSTERS[0]
    createMonsterTextures(this)
    this.drawHatchery()
    this.createWalls()
    this.guide = this.add.graphics()
    this.preview = this.add.image(GAME.width / 2, DROP_Y, this.nextMonster.key).setAlpha(0.85)
    this.status = this.add.text(180, 620, 'READY FOR YOUR FIRST DROP', { fontFamily: 'monospace', fontSize: '10px', color: '#a5c5ba' }).setOrigin(0.5)
    this.aim(180)
    this.input.on('pointermove', this.onPointerMove, this)
    this.input.on('pointerdown', this.onPointerDown, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointermove', this.onPointerMove, this)
      this.input.off('pointerdown', this.onPointerDown, this)
    })
  }

  private drawHatchery(): void {
    const g = this.add.graphics()
    g.fillStyle(0x213943).fillRect(0, 0, GAME.width, GAME.height)
    g.fillStyle(0x182e38).fillRect(CONTAINER.left, 108, CONTAINER.right - CONTAINER.left, 492)
    g.fillStyle(0x2a424b)
    for (let y = 120; y < 600; y += 24) {
      for (let x = 36; x < 330; x += 24) g.fillRect(x, y, 2, 2)
    }
    g.fillStyle(0x79988e).fillRect(14, 108, 12, 504).fillRect(334, 108, 12, 504).fillRect(14, 600, 332, 12)
    g.fillStyle(0xa5b99b).fillRect(14, 108, 4, 492).fillRect(334, 108, 4, 492).fillRect(14, 600, 332, 4)
    g.lineStyle(1, 0xe8a58b, 0.65)
    for (let x = 28; x < 334; x += 12) g.lineBetween(x, DANGER_Y, x + 6, DANGER_Y)
    this.add.text(180, 25, '↓  CHOOSE A LANDING SPOT  ↓', { fontFamily: 'monospace', fontSize: '11px', color: '#c0d5bc' }).setOrigin(0.5)
    this.add.text(32, DANGER_Y + 7, 'DANGER LINE · PREVIEW ONLY', { fontFamily: 'monospace', fontSize: '8px', color: '#e8a58b' })
  }

  private createWalls(): void {
    const options = { isStatic: true, friction: 0.6, restitution: 0.15 }
    // Walls extend above the screen to contain piled bodies without adding a lid.
    this.matter.add.rectangle(20, 200, 12, 800, options)
    this.matter.add.rectangle(340, 200, 12, 800, options)
    this.matter.add.rectangle(180, 612, 332, 24, options)
  }

  private aim(x: number): void {
    const position = clampDropX(x, this.nextMonster.radius)
    this.preview.setPosition(position, DROP_Y).setTexture(this.nextMonster.key)
      .setDisplaySize(this.nextMonster.radius * 2, this.nextMonster.radius * 2)
    this.guide.clear().lineStyle(1, 0xc5dfb1, 0.3)
      .lineBetween(position, DROP_Y + this.nextMonster.radius + 6, position, CONTAINER.floor)
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void { this.aim(pointer.x) }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.x < CONTAINER.left || pointer.x > CONTAINER.right || pointer.y > CONTAINER.floor || this.time.now < this.nextDropAt || this.count >= MAX_MONSTERS) return
    const monster = this.nextMonster
    const x = clampDropX(pointer.x, monster.radius)
    const body = this.matter.add.image(x, DROP_Y, monster.key)
    body.setCircle(24).setDisplaySize(monster.radius * 2, monster.radius * 2)
      .setBounce(0.35).setFriction(0.45).setFrictionAir(0.005)
    body.setName(monster.key)
    this.count += 1
    this.nextDropAt = this.time.now + DROP_COOLDOWN_MS
    this.nextMonster = Phaser.Utils.Array.GetRandom([...MONSTERS])
    this.aim(x)
    this.status.setText(this.count >= MAX_MONSTERS ? 'SANDBOX FULL · RESET TO PLAY AGAIN' : `${this.count} DROPPED  /  NEXT: ${this.nextMonster.name.toUpperCase()}`)
  }

  update(): void {
    this.preview.setAlpha(this.time.now < this.nextDropAt ? 0.3 : 0.85)
  }
}
