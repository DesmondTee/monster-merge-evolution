import { EventEmitter } from 'node:events'
import type Phaser from 'phaser'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { GameScene } from './GameScene'
import { GameBridge } from '../events'
import { discover, emptyCollection } from '../collection'
import type { SessionView } from '../session'
import { CONTAINER, DROP_COOLDOWN_MS, DROP_Y } from '../rules'

vi.mock('phaser', () => ({ default: {
  Scene: class {}, Scenes: { Events: { SHUTDOWN: 'shutdown', DESTROY: 'destroy' } },
  Utils: { Array: { GetRandom: () => 1 } },
} }))
vi.mock('../art/createMonsterTextures', () => ({ createMonsterTextures: vi.fn() }))
vi.mock('../art/evolutionEffect', () => ({ evolutionEffect: vi.fn() }))

// Phaser emitters bind the third context argument; preserve that contract here.
class Bus {
  private emitter = new EventEmitter()
  private callbacks = new Map<(...args: unknown[]) => void, (...args: unknown[]) => void>()
  on(name: string, fn: (...args: unknown[]) => void, context: object): void {
    const bound = this.callbacks.get(fn) ?? fn.bind(context)
    this.callbacks.set(fn, bound)
    this.emitter.on(name, bound)
  }
  once(name: string, fn: (...args: unknown[]) => void, context: object): void {
    const bound = this.callbacks.get(fn) ?? fn.bind(context)
    this.callbacks.set(fn, bound)
    this.emitter.once(name, bound)
  }
  off(name: string, fn: (...args: unknown[]) => void): void { this.emitter.off(name, this.callbacks.get(fn) ?? fn) }
  emit(name: string, ...args: unknown[]): void { this.emitter.emit(name, ...args) }
  count(name: string): number { return this.emitter.listenerCount(name) }
}

beforeEach(() => { vi.spyOn(Math, 'random').mockReturnValue(0.5) })
afterEach(() => { vi.restoreAllMocks() })

function harness() {
  const scores: number[] = []
  const views: SessionView[] = []
  const bridge = new GameBridge()
  const scene = new GameScene((value) => scores.push(value), (view) => views.push(view), bridge)
  const input = new Bus(), world = new Bus(), commands = new Bus(), lifecycle = new Bus()
  const pause = vi.fn(), resume = vi.fn()
  let id = 0
  const graphic = {
    setDepth: () => graphic, setAlpha: () => graphic, setOrigin: () => graphic, setPosition: () => graphic,
    setTexture: () => graphic, setDisplaySize: () => graphic, setText: () => graphic,
    setVisible: () => graphic, clear: () => graphic, lineStyle: () => graphic, lineBetween: () => graphic,
  }
  const image = vi.fn((x: number, y: number) => {
    const body = { id: ++id, position: { x, y }, circleRadius: 19, speed: 0 }
    const creature = {
      destroy: vi.fn(), body, active: true, x, y, setCircle: () => creature, setDisplaySize: () => creature,
      setBounce: () => creature, setFriction: () => creature, setFrictionAir: () => creature,
      setName: () => creature,
    }
    return creature
  })
  scene.input = input as unknown as Phaser.Input.InputPlugin
  scene.matter = { world: Object.assign(world, { pause, resume }), add: { image } } as unknown as Phaser.Physics.Matter.MatterPhysics
  scene.game = { events: commands, registry: new Map() } as unknown as Phaser.Game
  scene.events = lifecycle as unknown as Phaser.Events.EventEmitter
  scene.add = { graphics: () => graphic, image: () => graphic, text: () => graphic } as unknown as Phaser.GameObjects.GameObjectFactory
  scene.tweens = { pauseAll: vi.fn(), resumeAll: vi.fn() } as unknown as Phaser.Tweens.TweenManager
  scene['drawHatchery'] = vi.fn()
  scene['createWalls'] = vi.fn()
  return { bridge, scene, input, world, commands, lifecycle, pause, resume, image, scores, views }
}

describe('scene lifecycle and pointer integration', () => {
  it('removes all owned listeners and resets score, queue, cooldown and countdown across restarts', () => {
    const game = harness()
    for (let run = 0; run < 3; run++) {
      game.scene.create()
      expect(game.input.count('pointerdown')).toBe(1)
      expect(game.world.count('collisionstart')).toBe(1)
      game.input.emit('pointerdown', { x: 180, y: 300 })
      expect(game.scene['monsters'].size).toBe(1)
      game.scene['session'].tick(1200, true)
      game.scene['merges'].register(100, 0)
      game.scene['merges'].register(101, 0)
      game.scene['merges'].queue(100, 101)
      game.commands.emit('toggle-pause')
      expect(game.views.at(-1)?.state).toBe('paused')
      game.lifecycle.emit('shutdown')
      for (const name of ['pointerdown', 'pointermove']) expect(game.input.count(name)).toBe(0)
      for (const name of ['collisionstart', 'collisionactive', 'afterupdate']) expect(game.world.count(name)).toBe(0)
      for (const name of ['toggle-pause', 'toggle-sound', 'blur']) expect(game.commands.count(name)).toBe(0)
      expect(game.scene['monsters'].size).toBe(0)
      expect(game.scene['merges'].drain()).toEqual([])
    }
    game.scene.create()
    expect(game.scores).toEqual([0, 0, 0, 0])
    expect(game.views.at(-1)).toEqual({ state: 'playing', remaining: 0, nextLevel: 1 })
    expect(game.scene['session'].ready).toBe(true)
  })

  it('uses tap coordinates immediately, bounds the spawn, advances the preview and rejects rapid taps', () => {
    const game = harness()
    game.scene.create()
    for (let i = 0; i < 100; i++) game.input.emit('pointerdown', { x: CONTAINER.left, y: 200 })
    expect(game.image).toHaveBeenCalledTimes(1)
    expect(game.image.mock.calls[0]?.[0]).toBe(CONTAINER.left + 19)
    expect(game.scene['nextLevel']).toBe(1)
    game.scene.update(0, DROP_COOLDOWN_MS)
    game.input.emit('pointerdown', { x: CONTAINER.right, y: 200 })
    expect(game.image).toHaveBeenCalledTimes(2)
    expect(game.image.mock.calls[1]?.[0]).toBe(CONTAINER.right - 23)
    game.scene.update(0, DROP_COOLDOWN_MS)
    game.input.emit('pointerdown', { x: -1, y: 200 })
    game.input.emit('pointerdown', { x: 180, y: 601 })
    expect(game.image).toHaveBeenCalledTimes(2)
  })

  it('freezes physics on pause and game over, clears overflow and blocks drops until restart', () => {
    const game = harness()
    game.scene.create()
    game.scene['spawnMonster'](180, 130, 0)
    game.scene.update(0, 2000)
    expect(game.views.at(-1)?.remaining).toBe(1)
    game.commands.emit('toggle-pause')
    game.scene.update(0, 10000)
    expect(game.scene['session'].elapsed).toBe(2000)
    game.input.emit('pointerdown', { x: 180, y: 300 })
    expect(game.image).toHaveBeenCalledTimes(1)
    game.commands.emit('toggle-pause')
    const monster = game.scene['monsters'].values().next().value!
    ;(monster.body as MatterJS.BodyType).position.y = 300
    game.scene.update(0, 16)
    expect(game.views.at(-1)?.remaining).toBe(0)
    ;(monster.body as MatterJS.BodyType).position.y = 130
    game.scene.update(0, 3000)
    expect(game.views.at(-1)?.state).toBe('over')
    expect(game.pause).toHaveBeenCalledTimes(2)
    game.input.emit('pointerdown', { x: 180, y: 300 })
    expect(game.image).toHaveBeenCalledTimes(1)
  })

  it('automatically pauses on focus loss and preserves muted sound across scene restarts', () => {
    const game = harness()
    game.scene.create()
    game.commands.emit('toggle-sound')
    expect(game.scene['tones'].enabled).toBe(false)
    game.commands.emit('blur')
    game.commands.emit('blur')
    expect(game.views.at(-1)?.state).toBe('paused')
    game.lifecycle.emit('shutdown')
    game.scene.create()
    expect(game.scene['tones'].enabled).toBe(false)
  })

  it('cleans up on full game destruction after Matter has already destroyed its world', () => {
    const game = harness()
    game.scene.create()
    const close = vi.spyOn(game.scene['tones'], 'destroy')
    Object.assign(game.scene.matter, { world: null })
    expect(() => game.lifecycle.emit('destroy')).not.toThrow()
    expect(game.commands.count('toggle-pause')).toBe(0)
    expect(game.commands.count('toggle-sound')).toBe(0)
    expect(game.commands.count('blur')).toBe(0)
    expect(game.lifecycle.count('shutdown')).toBe(0)
    expect(close).toHaveBeenCalledOnce()
  })
})

describe('discovery bridge and encyclopedia integration', () => {
  it('rolls once per accepted drop and never rerolls inherited rarity during merges', () => {
    const game = harness()
    const appearances = vi.fn()
    game.bridge.on('appeared', appearances)
    game.scene.create()
    const random = vi.mocked(Math.random).mockReturnValue(0.019)
    random.mockClear()
    game.input.emit('pointerdown', { x: 180, y: 300 })
    game.input.emit('pointerdown', { x: 180, y: 300 })
    expect(random).toHaveBeenCalledOnce()
    expect(appearances).toHaveBeenLastCalledWith({ level: 0, source: 'drop', rare: true })
    expect(game.image.mock.calls[0]).toEqual([180, DROP_Y, 'sprout-rare'])
    game.scene['spawnMonster'](180, 300, 0, 'drop', false)
    const ids = [...game.scene['monsters'].keys()]
    game.world.emit('collisionstart', { pairs: [{ bodyA: { id: ids[0] }, bodyB: { id: ids[1] } }] })
    random.mockClear()
    game.world.emit('afterupdate')
    expect(random).not.toHaveBeenCalled()
    expect(appearances).toHaveBeenLastCalledWith({ level: 1, source: 'merge', rare: true })
    expect(game.scene['rareBodies'].size).toBe(1)
    expect(game.scores.at(-1)).toBe(10)
    game.lifecycle.emit('shutdown')
    expect(game.scene['rareBodies'].size).toBe(0)
  })

  it('emits appearances only for actual drops and merges, never texture generation or previews', () => {
    const game = harness()
    const appearances = vi.fn()
    game.bridge.on('appeared', appearances)
    game.scene.create()
    expect(appearances).not.toHaveBeenCalled()
    game.input.emit('pointerdown', { x: 180, y: 300 })
    expect(appearances).toHaveBeenLastCalledWith({ level: 0, source: 'drop', rare: false })
    game.scene['spawnMonster'](180, 300, 0)
    const ids = [...game.scene['monsters'].keys()]
    game.world.emit('collisionstart', { pairs: [{ bodyA: { id: ids[0] }, bodyB: { id: ids[1] } }] })
    expect(appearances).toHaveBeenCalledTimes(2)
    game.world.emit('afterupdate')
    expect(appearances).toHaveBeenLastCalledWith({ level: 1, source: 'merge', rare: false })
    expect(appearances).toHaveBeenCalledTimes(3)
    game.world.emit('afterupdate')
    expect(appearances).toHaveBeenCalledTimes(3)
  })

  it('pauses physics through the typed bridge, blocks input, and cleans subscriptions', () => {
    const game = harness()
    game.scene.create()
    game.bridge.emit('encyclopedia', true)
    expect(game.pause).toHaveBeenCalledOnce()
    game.input.emit('pointerdown', { x: 180, y: 300 })
    game.scene.update(0, 5000)
    expect(game.image).not.toHaveBeenCalled()
    game.bridge.emit('encyclopedia', false)
    expect(game.views.at(-1)?.state).toBe('playing')
    game.commands.emit('toggle-pause')
    game.bridge.emit('encyclopedia', true)
    game.bridge.emit('encyclopedia', false)
    expect(game.views.at(-1)?.state).toBe('paused')
    game.lifecycle.emit('shutdown')
    const count = game.pause.mock.calls.length
    game.bridge.emit('encyclopedia', true)
    expect(game.pause).toHaveBeenCalledTimes(count)
    game.scene.create()
    expect(game.views.at(-1)?.state).toBe('paused')
    game.bridge.emit('encyclopedia', false)
    expect(game.views.at(-1)?.state).toBe('playing')
  })

  it('retains collection through scene shutdown, restart and duplicate appearances', () => {
    const game = harness()
    let collection = emptyCollection()
    const unlock = vi.fn()
    game.bridge.on('appeared', ({ level, source }) => {
      const result = discover(collection, level, source)
      collection = result.save
      if (result.unlocked) unlock(level)
    })
    for (let i = 0; i < 3; i++) {
      game.scene.create()
      game.input.emit('pointerdown', { x: 180, y: 300 })
      game.lifecycle.emit('shutdown')
    }
    expect(collection.discovered).toEqual(['sprout'])
    expect(unlock).toHaveBeenCalledOnce()
  })
})
