import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import { ScoreBoard } from './ScoreBoard'
import { loadBestScore, saveBestScore } from '../game/scoring'

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [session, setSession] = useState(0)
  const [error, setError] = useState(false)
  const [score, setScore] = useState(0)
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
      })
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
  }, [session])

  return <>
    <ScoreBoard score={score} best={best} />
    <div ref={hostRef} className="game-canvas" role="img" aria-label="Monster merging playground. Aim and drop with mouse or touch. Matching monsters evolve and earn points." />
    {error && <p role="alert">The game could not load. Please reset or reload the page.</p>}
    <button className="reset-button" onClick={() => { setError(false); setScore(0); setSession((value) => value + 1) }}>↻ Reset hatchery</button>
  </>
}
