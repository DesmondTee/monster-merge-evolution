// Original synthesized tones; no downloaded audio or persistent audio loops.
export class GameSound {
  private context?: AudioContext
  enabled = true
  play(kind: 'drop' | 'merge'): void {
    if (!this.enabled) return
    try {
      this.context ??= new AudioContext()
      const context = this.context
      void context.resume().catch(() => {})
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(kind === 'drop' ? 180 : 440, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'drop' ? 90 : 880, context.currentTime + 0.08)
      gain.gain.setValueAtTime(0.025, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.12)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    } catch { /* Audio support is optional. */ }
  }
  destroy(): void { void this.context?.close().catch(() => {}); this.context = undefined }
}
