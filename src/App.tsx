import { GameCanvas } from './components/GameCanvas'

export default function App() {
  return (
    <main className="arcade">
      <header className="intro">
        <p className="eyebrow">A LITTLE DROP. A NEW BEGINNING.</p>
        <h1>Monster Merge <span>Evolution</span></h1>
        <p>An original creature playground. Find your spot, drop a monster, and watch the pile come alive.</p>
        <div className="milestone">04 / FIELD JOURNAL</div>
      </header>
      <section className="game-panel" aria-label="Monster playground">
        <div className="panel-heading"><span>THE HATCHERY</span><span>MERGE & EVOLVE</span></div>
        <GameCanvas />
        <p className="controls">MOVE TO AIM · CLICK OR TAP TO DROP</p>
      </section>
      <aside className="field-notes">
        <p className="eyebrow">FIELD NOTES / 004</p>
        <h2>Little collisions.<br />Big evolutions.</h2>
        <p>Match two of a kind to discover ten original creatures, from tiny Spriggle to crowned Solossus.</p>
        <ul><li>Matching monsters merge on contact.</li><li>Clear the danger line within 3 seconds.</li><li>Open your encyclopedia. Keep every discovery.</li></ul>
        <p className="coming-next">EVOLUTION NOTES<br /><strong>Spriggle → Cindlet → Dewble → … → Solossus</strong><br />10 · 20 · 40 POINTS AND BEYOND</p>
      </aside>
      <footer>ORIGINAL PIXEL CREATURES <span>✦</span> MILESTONE 04</footer>
    </main>
  )
}
