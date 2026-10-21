import Phaser from 'phaser'
import { GameBridge } from '../events'
import { createMonsterTextures } from '../art/createMonsterTextures'
import { evolutionEffect } from '../art/evolutionEffect'
import { DROP_LEVELS, MONSTERS } from '../monsters'
import { MergeQueue } from '../merging'
import { Session, OverflowTracker, OVERFLOW_MS, type SessionView } from '../session'
import { GameSound } from '../sound'
import { CONTAINER, DANGER_Y, DROP_Y, GAME, MAX_MONSTERS, clampDropX } from '../rules'

export class GameScene extends Phaser.Scene {
  private bridge: GameBridge
  private unsubscribeEncyclopedia?: () => void
  private nextLevel = 0
  private preview!: Phaser.GameObjects.Image
  private guide!: Phaser.GameObjects.Graphics
  private status!: Phaser.GameObjects.Text
  private session = new Session()
  private overflow = new OverflowTracker()
  private tones = new GameSound()
  private queuedLevel = 0
  private queuedPreview!: Phaser.GameObjects.Image
  private lastView = ''
  private monsters = new Map<number, Phaser.Physics.Matter.Image>()
  private merges = new MergeQueue()
  private score = 0
  private readonly onScore: (score: number) => void

  private readonly onView: (view: SessionView) => void

  constructor(onScore: (score: number) => void = () => {}, onView: (view: SessionView) => void = () => {}, bridge = new GameBridge()) {
    super('GameScene')
    this.bridge = bridge
    this.onScore = onScore
    this.onView = onView
  }

  create(): void {
    this.monsters.clear()
    this.merges = new MergeQueue()
    this.score = 0
    this.onScore(0)
    this.session = new Session()
    this.overflow.clear()
    this.lastView = ''
    this.matter.world.resume()
    this.tones = new GameSound()
    this.tones.enabled = this.game.registry.get('soundEnabled') !== false
    this.queuedLevel = Phaser.Utils.Array.GetRandom([...DROP_LEVELS])
    this.nextLevel = 0
    createMonsterTextures(this)
    this.drawHatchery()
    this.createWalls()
    this.guide = this.add.graphics()
    this.preview = this.add.image(GAME.width / 2, DROP_Y, MONSTERS[this.nextLevel]!.key).setAlpha(0.85)
    this.status = this.add.text(180, 620, 'READY FOR YOUR FIRST DROP', { fontFamily: 'monospace', fontSize: '10px', color: '#a5c5ba' }).setOrigin(0.5)
    this.aim(180)
    this.add.text(290, 47, 'NEXT', { fontFamily: 'monospace', fontSize: '9px', color: '#c0d5bc' }).setOrigin(0.5)
    this.queuedPreview = this.add.image(290, 77, MONSTERS[this.queuedLevel]!.key).setDisplaySize(32, 32)
    this.unsubscribeEncyclopedia = this.bridge.on('encyclopedia', (open) => {
      this.session.setEncyclopedia(open)
      this.syncPhysics()
      this.publishView()
    })
    this.session.setEncyclopedia(this.bridge.encyclopediaOpen)
    if (this.bridge.encyclopediaOpen) this.syncPhysics()
    this.publishView()
    this.game.events.on('toggle-pause', this.togglePause, this)
    this.game.events.on('toggle-sound', this.toggleSound, this)
    this.game.events.on('blur', this.onBlur, this)
    this.input.on('pointermove', this.onPointerMove, this)
    this.input.on('pointerdown', this.onPointerDown, this)
    this.matter.world.on('collisionstart', this.onCollision, this)
    this.matter.world.on('collisionactive', this.onCollision, this)
    this.matter.world.on('afterupdate', this.applyMerges, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)
  }

  private cleanup(): void {
    this.unsubscribeEncyclopedia?.()
    this.unsubscribeEncyclopedia = undefined
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.off(Phaser.Scenes.Events.DESTROY, this.cleanup, this)
    this.input.off('pointermove', this.onPointerMove, this)
    this.input.off('pointerdown', this.onPointerDown, this)
    // Matter's own shutdown runs first and can already have cleared its world.
    this.matter.world?.off('collisionstart', this.onCollision, this)
    this.matter.world?.off('collisionactive', this.onCollision, this)
    this.matter.world?.off('afterupdate', this.applyMerges, this)
    this.game.events.off('toggle-pause', this.togglePause, this)
    this.game.events.off('toggle-sound', this.toggleSound, this)
    this.game.events.off('blur', this.onBlur, this)
    this.tones.destroy()
    this.monsters.clear()
    this.overflow.clear()
    this.merges = new MergeQueue()
  }

  private toggleSound(): void {
    this.tones.enabled = !this.tones.enabled
    this.game.registry.set('soundEnabled', this.tones.enabled)
  }

  private onBlur(): void { this.session.pause(); this.syncPhysics(); this.publishView() }

  private togglePause(): void {
    this.session.togglePause()
    this.syncPhysics()
    this.publishView()
  }

  private syncPhysics(): void {
    if (this.session.state === 'playing') { this.matter.world.resume(); this.tweens.resumeAll() }
    else { this.matter.world.pause(); this.tweens.pauseAll() }
  }

  private publishView(): void {
    const view = { state: this.session.state, remaining: this.session.remaining, nextLevel: this.queuedLevel }
    const key = JSON.stringify(view)
    if (key !== this.lastView) { this.lastView = key; this.onView(view) }
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
    this.add.text(32, DANGER_Y + 7, 'DANGER · KEEP THE PILE BELOW', { fontFamily: 'monospace', fontSize: '8px', color: '#e8a58b' })
  }

  private createWalls(): void {
    const options = { isStatic: true, friction: 0.6, restitution: 0.15 }
    // Walls extend above the screen to contain piled bodies without adding a lid.
    this.matter.add.rectangle(20, 200, 12, 800, options)
    this.matter.add.rectangle(340, 200, 12, 800, options)
    this.matter.add.rectangle(180, 612, 332, 24, options)
  }

  private aim(x: number): void {
    const monster = MONSTERS[this.nextLevel]!
    const position = clampDropX(x, monster.radius)
    this.preview.setPosition(position, DROP_Y).setTexture(monster.key)
      .setDisplaySize(monster.radius * 2, monster.radius * 2)
    this.guide.clear().lineStyle(1, 0xc5dfb1, 0.3)
      .lineBetween(position, DROP_Y + monster.radius + 6, position, CONTAINER.floor)
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void { if (this.session.state === 'playing') this.aim(pointer.x) }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.x < CONTAINER.left || pointer.x > CONTAINER.right || pointer.y < 0 || pointer.y > CONTAINER.floor || this.monsters.size >= MAX_MONSTERS || !this.session.drop()) return
    const monster = MONSTERS[this.nextLevel]!
    const x = clampDropX(pointer.x, monster.radius)
    const id = this.spawnMonster(x, DROP_Y, this.nextLevel)
    this.overflow.add(id)
    this.tones.play('drop')
    this.nextLevel = this.queuedLevel
    this.queuedLevel = Phaser.Utils.Array.GetRandom([...DROP_LEVELS])
    this.queuedPreview.setTexture(MONSTERS[this.queuedLevel]!.key)
    this.publishView()
    this.aim(x)
    this.updateStatus()
  }

  private spawnMonster(x: number, y: number, level: number, source: 'drop' | 'merge' = 'drop'): number {
    const monster = MONSTERS[level]!
    const image = this.matter.add.image(clampDropX(x, monster.radius), Math.min(y, CONTAINER.floor - monster.radius), monster.key)
    image.setCircle(24).setDisplaySize(monster.radius * 2, monster.radius * 2)
      .setBounce(0.35).setFriction(0.45).setFrictionAir(0.005).setName(monster.key)
    const id = (image.body as MatterJS.BodyType).id
    this.monsters.set(id, image)
    this.merges.register(id, level)
    this.bridge.emit('appeared', { level, source })
    return id
  }

  private onCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    if (this.session.state !== 'playing') return
    for (const { bodyA, bodyB } of event.pairs) this.merges.queue(bodyA.id, bodyB.id)
  }

  private applyMerges(): void {
    if (this.session.state !== 'playing') return
    for (const plan of this.merges.drain()) {
      const first = this.monsters.get(plan.first)
      const second = this.monsters.get(plan.second)
      if (!first?.active || !second?.active) continue
      const x = (first.x + second.x) / 2
      const y = (first.y + second.y) / 2
      this.monsters.delete(plan.first)
      this.monsters.delete(plan.second)
      this.overflow.remove(plan.first)
      this.overflow.remove(plan.second)
      first.destroy()
      second.destroy()
      this.spawnMonster(x, y, plan.level, 'merge')
      this.score += plan.points
      this.onScore(this.score)
      this.tones.play('merge')
      evolutionEffect(this, x, y, MONSTERS[plan.level]!.accent, plan.points)
    }
    this.updateStatus()
  }

  private updateStatus(): void {
    this.status.setText(this.monsters.size >= MAX_MONSTERS ? 'HATCHERY FULL · WAIT FOR A MERGE'
      : `${this.monsters.size} IN HATCHERY / READY: ${MONSTERS[this.nextLevel]!.name.toUpperCase()}`)
  }

  update(_time: number, delta: number): void {
    if (this.session.state !== 'playing') return
    let overflowing = false
    for (const [id, image] of this.monsters) {
      const body = image.body as MatterJS.BodyType
      // Visit every drop so immunity progresses even while another body overflows.
      if (this.overflow.above(id, body.position.y - (body.circleRadius ?? image.displayHeight / 2), body.speed, delta)) overflowing = true
    }
    this.session.tick(delta, overflowing)
    if (this.session.elapsed >= OVERFLOW_MS) this.syncPhysics()
    this.preview.setVisible(this.session.state === 'playing').setAlpha(this.session.ready ? 0.85 : 0.3)
    this.publishView()
  }
}
