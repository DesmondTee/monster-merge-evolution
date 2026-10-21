import { useCallback, useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import { Encyclopedia } from './Encyclopedia'
import { DiscoveryNotice } from './DiscoveryNotice'
import { GameBridge } from '../game/events'
import { discover, emptyCollection, loadCollection, saveCollection } from '../game/collection'
import { ScoreBoard } from './ScoreBoard'
import { loadBestScore, saveBestScore } from '../game/scoring'
import type { SessionView } from '../game/session'
import { MONSTERS } from '../game/monsters'

export function GameCanvas() {
  const [bridge] = useState(() => new GameBridge())
  const [collection, setCollection] = useState(() => {
    try { return loadCollection(window.localStorage) } catch { return emptyCollection() }
  })
  const collectionRef = useRef(collection)
  const [encyclopediaOpen, setEncyclopediaOpen] = useState(false)
  const [notices, setNotices] = useState<number[]>([])
  const dismissNotice = useCallback(() => setNotices((queue) => queue.slice(1)), [])
  useEffect(() => bridge.on('appeared', ({ level, source }) => {
    const result = discover(collectionRef.current, level, source)
    if (result.save === collectionRef.current) return
    collectionRef.current = result.save
    setCollection(result.save)
    try { saveCollection(window.localStorage, result.save) } catch { /* Keep the in-memory collection. */ }
    if (result.unlocked) setNotices((queue) => [...queue, level])
  }), [bridge])
  const closeEncyclopedia = () => {
    bridge.emit('encyclopedia', false)
    setEncyclopediaOpen(false)
  }
  const hostRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [session, setSession] = useState(0)
  const [error, setError] = useState(false)
  const [score, setScore] = useState(0)
  const [view, setView] = useState<SessionView>({ state: 'playing', remaining: 0, nextLevel: 0 })
  const [sound, setSound] = useState(true)
  const soundRef = useRef(true)
  const [best, setBest] = useState(() => {
    try { return loadBestScore(window.localStorage) } catch { return 0 }
  })
  const bestRef = useRef(best)

  useEffect(() => {
    let cancelled = false
    void import('../game/createGame').then(({ createGame }) => {
      if (cancelled || !hostRef.current) return
      gameRef.current = createGame(hostRef.current, (value) => {
        if (cancelled) return
        setScore(value)
        if (value > bestRef.current) {
          bestRef.current = value
          setBest(value)
          try { saveBestScore(window.localStorage, value) } catch { /* Storage access can be blocked. */ }
        }
      }, (value) => { if (!cancelled) setView(value) }, bridge)
      gameRef.current.registry.set('soundEnabled', soundRef.current)
    }).catch(() => { if (!cancelled) setError(true) })
    return () => {
      cancelled = true
      // Phaser destroys on its next frame. Detach immediately for StrictMode
      // and rapid resets, so two canvases never occupy the live host.
      const game = gameRef.current
      gameRef.current = null
      game?.canvas?.remove()
      game?.destroy(true)
    }
  }, [session, bridge])

  const restart = () => {
    setError(false)
    setScore(0)
    setView({ state: 'playing', remaining: 0, nextLevel: 0 })
    setSession((value) => value + 1)
  }

  return <>
    {encyclopediaOpen && <Encyclopedia collection={collection} onClose={closeEncyclopedia} />}
    {notices[0] !== undefined && !encyclopediaOpen && <DiscoveryNotice level={notices[0]} onDismiss={dismissNotice} />}
    <ScoreBoard score={score} best={best} />
    <div className="game-toolbar">
      <button onClick={() => { bridge.emit('encyclopedia', true); setEncyclopediaOpen(true) }}>Encyclopedia {collection.discovered.length}/10</button>
      <button disabled={view.state === 'over'} onClick={() => gameRef.current?.events.emit('toggle-pause')}>{view.state === 'paused' ? '▶ Resume' : 'Ⅱ Pause'}</button>
      <button aria-pressed={sound} onClick={() => {
        soundRef.current = !soundRef.current
        setSound(soundRef.current)
        gameRef.current?.events.emit('toggle-sound')
      }}>Sound: {sound ? 'ON' : 'OFF'}</button>
    </div>
    <p className={`game-warning ${view.remaining ? 'overflow' : ''}`} role="status" aria-live="polite">
      {view.state === 'over' ? 'HATCHERY FULL' : view.state === 'paused' ? 'TAKE A BREATHER' : view.remaining ? `OVERFLOW · CLEAR THE LINE IN ${view.remaining}s` : `UP NEXT: ${MONSTERS[view.nextLevel]!.name.toUpperCase()} · KEEP BELOW THE LINE`}
    </p>
    <div className="playfield">
      <div ref={hostRef} className="game-canvas" role="img" aria-label="Monster merging playground. Aim and drop with mouse or touch. Matching monsters evolve and earn points." />
      {!encyclopediaOpen && view.state !== 'playing' && <div className="game-overlay">
        <section role="dialog" aria-modal="false" aria-labelledby="overlay-title" className="overlay-card">
          <p className="eyebrow">THE HATCHERY</p>
          <h2 id="overlay-title">{view.state === 'over' ? 'Game Over' : 'Paused'}</h2>
          {view.state === 'over' ? <><p>Final score <strong>{score.toLocaleString()}</strong></p><p>Best score <strong>{best.toLocaleString()}</strong></p><button autoFocus onClick={restart}>Play Again</button></>
            : <button autoFocus onClick={() => gameRef.current?.events.emit('toggle-pause')}>▶ Resume game</button>}
        </section>
      </div>}
    </div>
    {error && <p role="alert">The game could not load. Please reset or reload the page.</p>}
    <button className="reset-button" onClick={restart}>↻ Reset hatchery</button>
  </>
}
