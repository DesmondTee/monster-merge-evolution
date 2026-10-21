import { useEffect, useRef, useState } from 'react'
import { MONSTERS } from '../game/monsters'
import { ACHIEVEMENTS, type CollectionSave } from '../game/collection'
import { MonsterSprite } from './MonsterSprite'
import { lockPageScroll } from './lockPageScroll'

export function Encyclopedia({ collection, onClose }: { collection: CollectionSave; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState(() => MONSTERS.findIndex((m) => collection.discovered.includes(m.key)))
  useEffect(() => {
    const element = dialog.current!
    const unlockScroll = lockPageScroll(window, document.documentElement, document.body)
    element.showModal()
    return () => { element.close(); unlockScroll() }
  }, [])
  const monster = MONSTERS[selected]
  return <dialog ref={dialog} className="encyclopedia" aria-labelledby="encyclopedia-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
    <header className="encyclopedia-heading"><div><p className="eyebrow">FIELD JOURNAL / 004</p><h2 id="encyclopedia-title">Monster Encyclopedia</h2></div><button autoFocus onClick={onClose} aria-label="Close encyclopedia">✕ Close</button></header>
    <p className="collection-progress">{collection.discovered.length}/{MONSTERS.length} discovered</p>
    <progress aria-label="Collection progress" value={collection.discovered.length} max={MONSTERS.length} />
    <div className="monster-grid">{MONSTERS.map((entry, level) => {
      const unlocked = collection.discovered.includes(entry.key)
      return <button key={entry.key} disabled={!unlocked} aria-pressed={selected === level} onClick={() => setSelected(level)}>
        <span className="monster-number">{String(entry.evolutionLevel).padStart(2, '0')}</span>
        <MonsterSprite level={level} locked={!unlocked} /><span>{unlocked ? entry.name : 'Locked'}</span>
      </button>
    })}</div>
    <section className="monster-detail" aria-live="polite">{monster && collection.discovered.includes(monster.key) ? <>
      <MonsterSprite level={selected} /><div><h3>{monster.name}</h3><p className="eyebrow">LEVEL {monster.evolutionLevel} · {monster.element.toUpperCase()}</p><p>{monster.description}</p><small>{monster.visual}</small></div>
    </> : <p>Drop and merge monsters to begin your field journal.</p>}</section>
    <h3>Achievements</h3>
    <ul className="achievements">{ACHIEVEMENTS.map((achievement) => <li key={achievement.id} className={collection.achievements.includes(achievement.id) ? 'earned' : ''}>
      <strong>{collection.achievements.includes(achievement.id) ? '★ Unlocked' : '◇ Locked'} · {achievement.name}</strong><span>{achievement.description}</span>
    </li>)}</ul>
  </dialog>
}
