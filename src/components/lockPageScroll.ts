// Fixed-body locking also prevents background touch scrolling on mobile Safari.
// Restore only the properties we own, including the exact previous scroll position.
export function lockPageScroll(page: Pick<Window, 'scrollX' | 'scrollY' | 'scrollTo'>, root: HTMLElement, body: HTMLElement): () => void {
  const { scrollX, scrollY } = page
  const rootOverflow = root.style.overflow
  const properties = ['position', 'top', 'left', 'width', 'overflow'] as const
  const previous = properties.map((property) => body.style[property])
  root.style.overflow = 'hidden'
  Object.assign(body.style, { position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`, width: '100%', overflow: 'hidden' })
  return () => {
    root.style.overflow = rootOverflow
    properties.forEach((property, index) => { body.style[property] = previous[index]! })
    page.scrollTo(scrollX, scrollY)
  }
}
