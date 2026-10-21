import { useEffect, useRef, useState } from 'react'
import { MONSTERS } from '../game/monsters'
import { ACHIEVEMENTS, type CollectionSave } from '../game/collection'
import { MonsterSprite } from './MonsterSprite'
import { lockPageScroll } from './lockPageScroll'

export function Encyclopedia({ collection, onClose }: { collection: CollectionSave; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [rare, setRare] = useState(false)
  const discoveries = rare ? collection.rareDiscovered : collection.discovered
  const [selected, setSelected] = useState(() => MONSTERS.findIndex((m) => collection.discovered.includes(m.key)))
  useEffect(() => {
    const element = dialog.current!
    const unlockScroll = lockPageScroll(window, document.documentElement, document.body)
    element.showModal()
    return () => { element.close(); unlockScroll() }
  }, [])
  const monster = MONSTERS[selected]
  return <dialog ref={dialog} className="encyclopedia" aria-labelledby="encyclopedia-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
    <header className="encyclopedia-heading"><div><p className="eyebrow">FIELD JOURNAL / 005</p><h2 id="encyclopedia-title">Monster Encyclopedia</h2></div><button autoFocus onClick={onClose} aria-label="Close encyclopedia">✕ Close</button></header>
    <p className="collection-progress">Normal {collection.discovered.length}/{MONSTERS.length} · ✦ Rare {collection.rareDiscovered.length}/{MONSTERS.length}</p>
    <div className="variant-toggle" role="group" aria-label="Monster variant">{[false, true].map((variant) => <button key={String(variant)} aria-pressed={rare === variant} onClick={() => {
      setRare(variant)
      setSelected(MONSTERS.findIndex((m) => (variant ? collection.rareDiscovered : collection.discovered).includes(m.key)))
    }}>{variant ? '✦ Rare variants' : 'Normal variants'}</button>)}</div>
    <progress aria-label={rare ? 'Rare collection progress' : 'Normal collection progress'} value={discoveries.length} max={MONSTERS.length} />
    <div className="monster-grid">{MONSTERS.map((entry, level) => {
      const unlocked = discoveries.includes(entry.key)
      return <button key={entry.key} disabled={!unlocked} aria-pressed={selected === level} onClick={() => setSelected(level)}>
        <span className="monster-number">{String(entry.evolutionLevel).padStart(2, '0')}</span>
        <MonsterSprite level={level} rare={rare} locked={!unlocked} /><span>{unlocked ? `${rare ? '✦ ' : ''}${entry.name}` : 'Locked'}</span>
        {rare && unlocked && <small className="rare-badge">RARE DISCOVERED</small>}
      </button>
    })}</div>
    <section className="monster-detail" aria-live="polite">{monster && discoveries.includes(monster.key) ? <>
      <MonsterSprite level={selected} rare={rare} /><div><h3>{rare ? '✦ Rare ' : ''}{monster.name}</h3><p className="eyebrow">LEVEL {monster.evolutionLevel} · {monster.element.toUpperCase()}</p><p>{monster.description}</p><small>{monster.visual}</small></div>
    </> : <p>{rare ? 'Rare drops have alternate colors and sparkles. Evolve them to discover more!' : 'Drop and merge monsters to begin your field journal.'}</p>}</section>
    <h3>Achievements</h3>
    <p className="achievement-help">Species discovered in either palette count toward achievements.</p>
    <ul className="achievements">{ACHIEVEMENTS.map((achievement) => <li key={achievement.id} className={collection.achievements.includes(achievement.id) ? 'earned' : ''}>
      <strong>{collection.achievements.includes(achievement.id) ? '★ Unlocked' : '◇ Locked'} · {achievement.name}</strong><span>{achievement.description}</span>
    </li>)}</ul>
  </dialog>
}
