import { GameCanvas } from './components/GameCanvas'

export default function App() {
  return (
    <main className="arcade">
      <header className="intro">
        <p className="eyebrow">A LITTLE DROP. A NEW BEGINNING.</p>
        <h1>Monster Merge <span>Evolution</span></h1>
        <p>An original creature playground. Find your spot, drop a monster, and watch the pile come alive.</p>
        <div className="milestone">01 / FIRST CONTACT</div>
      </header>
      <section className="game-panel" aria-label="Monster playground">
        <div className="panel-heading"><span>THE HATCHERY</span><span>PHYSICS SANDBOX</span></div>
        <GameCanvas />
        <p className="controls">MOVE TO AIM · CLICK OR TAP TO DROP</p>
      </section>
      <aside className="field-notes">
        <p className="eyebrow">FIELD NOTES / 001</p>
        <h2>Meet your first<br />little monsters.</h2>
        <p>Sprout, Ember, and Dew are ready for their first gravity experiment.</p>
        <ul><li>Drop anywhere inside the hatchery.</li><li>Watch them bounce and settle.</li><li>Reset to start a fresh experiment.</li></ul>
        <p className="coming-next">COMING NEXT<br /><strong>Merging · Scoring · Survival</strong></p>
      </aside>
      <footer>ORIGINAL PIXEL CREATURES <span>✦</span> MILESTONE 01</footer>
    </main>
  )
}
