import { describe, expect, it, vi } from 'vitest'
import { lockPageScroll } from './lockPageScroll'

function surface() {
  const root = { style: { overflow: 'auto' } } as HTMLElement
  const body = { style: { position: 'relative', top: '3px', left: '', width: '90%', overflow: 'visible' } } as HTMLElement
  const page = { scrollX: 12, scrollY: 640, scrollTo: vi.fn() }
  return { root, body, page }
}

describe('encyclopedia page scroll lock', () => {
  it('locks the background at its current position and restores styles and scroll on close', () => {
    const { root, body, page } = surface()
    const unlock = lockPageScroll(page, root, body)
    expect(root.style.overflow).toBe('hidden')
    expect(body.style).toEqual({ position: 'fixed', top: '-640px', left: '-12px', width: '100%', overflow: 'hidden' })
    unlock()
    expect(root.style.overflow).toBe('auto')
    expect(body.style).toEqual({ position: 'relative', top: '3px', left: '', width: '90%', overflow: 'visible' })
    expect(page.scrollTo).toHaveBeenCalledWith(12, 640)
  })

  it('restores correctly through repeated open/close and StrictMode effect cleanup', () => {
    const { root, body, page } = surface()
    for (let i = 0; i < 3; i++) {
      const unlock = lockPageScroll(page, root, body)
      expect(body.style.top).toBe('-640px')
      unlock()
      expect(body.style.position).toBe('relative')
      expect(root.style.overflow).toBe('auto')
    }
    expect(page.scrollTo).toHaveBeenCalledTimes(3)
  })
})
