export const BEST_SCORE_KEY = 'monster-merge-evolution.best-score'
type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>

export function loadBestScore(storage: ScoreStorage): number {
  try {
    const value = Number(storage.getItem(BEST_SCORE_KEY))
    return Number.isSafeInteger(value) && value >= 0 ? value : 0
  } catch { return 0 }
}

export function saveBestScore(storage: ScoreStorage, score: number): void {
  try { storage.setItem(BEST_SCORE_KEY, String(Math.max(loadBestScore(storage), score))) } catch {
    // Gameplay and the in-memory record still work when storage is unavailable.
  }
}
