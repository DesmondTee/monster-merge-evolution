export function ScoreBoard({ score, best }: { score: number; best: number }) {
  return <div className="scoreboard" aria-label="Scores">
    <div><span>SCORE</span><strong>{score.toLocaleString()}</strong></div>
    <div><span>BEST</span><strong>{best.toLocaleString()}</strong></div>
  </div>
}
