import { useEffect } from 'react'
import { MONSTERS } from '../game/monsters'
import { MonsterSprite } from './MonsterSprite'

export function DiscoveryNotice({ level, rare, onDismiss }: { level: number; rare: boolean; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [level, rare, onDismiss])
  return <aside className={`discovery-notice${rare ? ' rare-notice' : ''}`} aria-label={rare ? 'Rare monster discovery' : 'Monster discovery'}>
    <span className="discovery-sparkles" aria-hidden="true">✦ · ✧</span><MonsterSprite level={level} rare={rare} />
    <div role="status"><p>{rare ? '✦ Rare Monster Discovered!' : 'New Monster Discovered!'}</p><strong>{MONSTERS[level]!.name}</strong></div>
    <button onClick={onDismiss} aria-label="Dismiss discovery notification">✕</button>
  </aside>
}
