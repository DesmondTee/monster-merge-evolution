/// <reference types="node" />
import { createRequire } from 'node:module'
import { describe, expect, it, vi } from 'vitest'
import type Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { MONSTERS } from './monsters'

// Load Phaser's exact bundled Matter engine without requiring a browser canvas.
const require = createRequire(import.meta.url)
const Engine = require('phaser/src/physics/matter-js/lib/core/Engine') as typeof MatterJS.Engine
const Bodies = require('phaser/src/physics/matter-js/lib/factory/Bodies') as typeof MatterJS.Bodies
const Body = require('phaser/src/physics/matter-js/lib/body/Body') as typeof MatterJS.Body
const Composite = require('phaser/src/physics/matter-js/lib/body/Composite') as typeof MatterJS.Composite
const Events = require('phaser/src/physics/matter-js/lib/core/Events') as typeof MatterJS.Events
const Sleeping = require('phaser/src/physics/matter-js/lib/core/Sleeping') as typeof MatterJS.Sleeping

vi.mock('phaser', () => ({ default: { Scene: class {} } }))
vi.mock('./art/evolutionEffect', () => ({ evolutionEffect: vi.fn() }))

function harness() {
  const scores: number[] = []
  const scene = new GameScene((score) => scores.push(score))
  const engine = Engine.create({ enableSleeping: true })
  engine.world.gravity.y = 0
  // Phaser's legacy declarations type the composite world as a World factory.
  const world = engine.world as unknown as MatterJS.CompositeType
  const destroyed: number[] = []
  // Only the Phaser image rendering facade is replaced. Actual bodies, collision
  // events, stepping, removal and the scene's merge implementation run normally.
  scene.matter = { add: { image: (x: number, y: number) => {
    const body = Bodies.circle(x, y, 24)
    Composite.add(world, body)
    const image = {
      body, active: true,
      get x() { return body.position.x }, get y() { return body.position.y },
      setCircle: () => image,
      setDisplaySize: (width: number) => { Body.scale(body, width / 48, width / 48); return image },
      setBounce: (value: number) => { body.restitution = value; return image },
      setFriction: (value: number) => { body.friction = value; return image },
      setFrictionAir: (value: number) => { body.frictionAir = value; return image }, setName: () => image,
      destroy: () => { image.active = false; destroyed.push(body.id); Composite.remove(world, body) },
    }
    return image
  } } } as unknown as Phaser.Physics.Matter.MatterPhysics
  scene['status'] = { setText: () => {} } as unknown as Phaser.GameObjects.Text
  Events.on(engine, 'collisionStart', (event) => scene['onCollision'](event as unknown as Phaser.Physics.Matter.Events.CollisionStartEvent))
  Events.on(engine, 'collisionActive', (event) => scene['onCollision'](event as unknown as Phaser.Physics.Matter.Events.CollisionStartEvent))
  Events.on(engine, 'afterUpdate', () => scene['applyMerges']())
  return {
    scene, scores, destroyed,
    spawn: (x: number, y: number, level: number, rare = false) => scene['spawnMonster'](x, y, level, 'drop', rare),
    step: () => Engine.update(engine, 1000 / 60),
    bodies: () => Composite.allBodies(world),
  }
}

describe('scene integration with bundled Matter.js', () => {
  it('keeps rare and normal physics identical and merges mixed palettes through real Matter contacts', () => {
    const game = harness()
    game.spawn(180, 300, 0, true)
    game.spawn(180, 300, 0)
    const [rare, normal] = game.bodies()
    for (const field of ['circleRadius', 'mass', 'friction', 'frictionAir', 'restitution', 'inertia'] as const) {
      expect(rare![field]).toBe(normal![field])
    }
    game.spawn(180, 300, 1)
    game.step()
    game.step()
    expect(game.bodies()).toHaveLength(1)
    expect(game.bodies()[0]!.circleRadius).toBe(MONSTERS[2].radius)
    expect(game.scene['rareBodies']).toEqual(new Set([game.bodies()[0]!.id]))
    expect(game.scores).toEqual([10, 30])
  })

  it('removes two colliders, spawns once at their midpoint with correct size, and chains on the next step', () => {
    const game = harness()
    game.spawn(180, 300, 0)
    game.spawn(180, 300, 0)
    game.spawn(180, 300, 1)
    const originals = game.bodies()
    const originalIds = originals.map((body) => body.id)
    game.step()
    expect(game.scores).toEqual([10])
    expect(game.bodies()).toHaveLength(2)
    expect(game.destroyed).toEqual(originalIds.slice(0, 2))
    const newborn = game.bodies().find((body) => !originalIds.includes(body.id))!
    expect(newborn.position.x).toBeCloseTo((originals[0]!.position.x + originals[1]!.position.x) / 2)
    // Matter resolves contacts before the scene computes the midpoint.
    expect(newborn.position.y).toBeCloseTo((originals[0]!.position.y + originals[1]!.position.y) / 2)
    expect(newborn.circleRadius).toBe(MONSTERS[1].radius)
    game.step()
    expect(game.scores).toEqual([10, 30])
    expect(game.bodies()).toHaveLength(1)
    expect(game.bodies()[0]!.circleRadius).toBe(MONSTERS[2].radius)
    for (let step = 0; step < 100; step++) game.step()
    expect(game.scores).toEqual([10, 30])
    expect(new Set(game.destroyed).size).toBe(4)
  })

  it('handles a crowd of simultaneous contacts without duplicate destruction or scoring', () => {
    const game = harness()
    for (let i = 0; i < 8; i++) game.spawn(180, 300, 0)
    // Bring each generation together to exercise three rapid collision waves.
    for (let step = 0; step < 3; step++) {
      for (const body of game.bodies()) Body.setPosition(body, { x: 180, y: 300 })
      game.step()
    }
    expect(game.bodies()).toHaveLength(1)
    expect(game.bodies()[0]!.circleRadius).toBe(MONSTERS[3].radius)
    expect(game.scores.at(-1)).toBe(120)
    expect(game.destroyed).toHaveLength(14)
    expect(new Set(game.destroyed).size).toBe(14)
  })

  it('leaves terminal-level creatures intact through repeated contacts', () => {
    const game = harness()
    game.spawn(180, 300, 9)
    game.spawn(180, 300, 9)
    for (let step = 0; step < 60; step++) game.step()
    expect(game.bodies()).toHaveLength(2)
    expect(game.destroyed).toEqual([])
    expect(game.scores).toEqual([])
  })

  it('merges a newborn into a matching sleeping creature', () => {
    const game = harness()
    game.spawn(180, 300, 0)
    game.spawn(180, 300, 0)
    game.spawn(180, 300, 1)
    Sleeping.set(game.bodies()[2]!, true)
    game.step()
    game.step()
    expect(game.scores).toEqual([10, 30])
    expect(game.bodies()).toHaveLength(1)
  })

  it('keeps a 64-body chain finite and contained through six generations and prolonged settling', () => {
    const game = harness()
    for (let i = 0; i < 64; i++) game.spawn(180, 300, 0)
    for (let wave = 0; wave < 6; wave++) {
      for (const body of game.bodies()) Body.setPosition(body, { x: 180, y: 300 })
      game.step()
    }
    expect(game.bodies()).toHaveLength(1)
    expect(game.scores.at(-1)).toBe(1920)
    expect(new Set(game.destroyed).size).toBe(126)
    for (let step = 0; step < 600; step++) game.step()
    for (const body of game.bodies()) {
      expect(Number.isFinite(body.position.x)).toBe(true)
      expect(Number.isFinite(body.position.y)).toBe(true)
      expect(body.position.x - body.circleRadius!).toBeGreaterThanOrEqual(26)
      expect(body.position.x + body.circleRadius!).toBeLessThanOrEqual(334)
    }
    expect(game.scores.at(-1)).toBe(1920)
  })
})
