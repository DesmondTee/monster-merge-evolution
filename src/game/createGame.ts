import Phaser from 'phaser'
import type { GameBridge } from './events'
import { GameScene } from './scenes/GameScene'
import { GAME } from './rules'
import type { SessionView } from './session'

export function createGame(parent: HTMLElement, onScore: (score: number) => void, onView: (view: SessionView) => void, bridge?: GameBridge): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO, parent, width: GAME.width, height: GAME.height,
    backgroundColor: '#172b35', pixelArt: true, antialias: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
      default: 'matter',
      matter: { gravity: { x: 0, y: 1.2 }, enableSleeping: true, debug: false },
    },
    scene: [new GameScene(onScore, onView, bridge)],
  })
}
