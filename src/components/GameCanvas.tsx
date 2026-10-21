import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [session, setSession] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void import('../game/createGame').then(({ createGame }) => {
      if (cancelled || !hostRef.current) return
      gameRef.current = createGame(hostRef.current)
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
    <div ref={hostRef} className="game-canvas" role="img" aria-label="Monster drop physics playground. Use a mouse or touch to aim and drop." />
    {error && <p role="alert">The game could not load. Please reset or reload the page.</p>}
    <button className="reset-button" onClick={() => { setError(false); setSession((value) => value + 1) }}>↻ Reset hatchery</button>
  </>
}
