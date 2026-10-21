import { useEffect } from 'react'
import { MONSTERS } from '../game/monsters'
import { MonsterSprite } from './MonsterSprite'

export function DiscoveryNotice({ level, onDismiss }: { level: number; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [level, onDismiss])
  return <aside className="discovery-notice" aria-label="Monster discovery">
    <span className="discovery-sparkles" aria-hidden="true">✦ · ✧</span><MonsterSprite level={level} />
    <div role="status"><p>New Monster Discovered!</p><strong>{MONSTERS[level]!.name}</strong></div>
    <button onClick={onDismiss} aria-label="Dismiss discovery notification">✕</button>
  </aside>
}
