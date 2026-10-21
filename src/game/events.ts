// A small, typed bridge shared by React and Phaser. Subscriptions own their cleanup.
export interface GameEvents {
  appeared: { level: number; source: 'drop' | 'merge' }
  encyclopedia: boolean
}

export class GameBridge {
  encyclopediaOpen = false
  private listeners: { [K in keyof GameEvents]: Set<(value: GameEvents[K]) => void> } = {
    appeared: new Set(), encyclopedia: new Set(),
  }
  on<K extends keyof GameEvents>(event: K, listener: (value: GameEvents[K]) => void): () => void {
    this.listeners[event].add(listener)
    return () => { this.listeners[event].delete(listener) }
  }
  emit<K extends keyof GameEvents>(event: K, value: GameEvents[K]): void {
    if (event === 'encyclopedia') this.encyclopediaOpen = value === true
    this.listeners[event].forEach((listener) => listener(value))
  }
}
