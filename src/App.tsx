import { GameCanvas } from './components/GameCanvas'

export default function App() {
  return (
    <main className="arcade">
      <header className="intro">
        <p className="eyebrow">A LITTLE DROP. A NEW BEGINNING.</p>
        <h1>Monster Merge <span>Evolution</span></h1>
        <p>An original creature playground. Find your spot, drop a monster, and watch the pile come alive.</p>
        <div className="milestone">02 / BETTER TOGETHER</div>
      </header>
      <section className="game-panel" aria-label="Monster playground">
        <div className="panel-heading"><span>THE HATCHERY</span><span>MERGE & EVOLVE</span></div>
        <GameCanvas />
        <p className="controls">MOVE TO AIM · CLICK OR TAP TO DROP</p>
      </section>
      <aside className="field-notes">
        <p className="eyebrow">FIELD NOTES / 002</p>
        <h2>Little collisions.<br />Big evolutions.</h2>
        <p>Match two of a kind to discover ten original creatures, from tiny Sprout to crowned Solossus.</p>
        <ul><li>Matching monsters merge on contact.</li><li>Build chain reactions for bigger scores.</li><li>Reset your pile. Keep your best score.</li></ul>
        <p className="coming-next">EVOLUTION NOTES<br /><strong>Sprout → Ember → Dew → … → Solossus</strong><br />10 · 20 · 40 POINTS AND BEYOND</p>
      </aside>
      <footer>ORIGINAL PIXEL CREATURES <span>✦</span> MILESTONE 02</footer>
    </main>
  )
}
