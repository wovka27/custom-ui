import { onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue'

export type UiFloatingSide = 'top' | 'bottom' | 'start' | 'end'
export type UiFloatingAlign = 'start' | 'center' | 'end'

interface AnchoredPosition {
  update: () => void
}

const opposite = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
} as const

type PhysicalSide = keyof typeof opposite

export function useAnchoredPosition(
  anchor: MaybeRefOrGetter<HTMLElement | null>,
  floating: MaybeRefOrGetter<HTMLElement | null>,
  side: MaybeRefOrGetter<UiFloatingSide> = 'bottom',
  align: MaybeRefOrGetter<UiFloatingAlign> = 'start',
  active: MaybeRefOrGetter<boolean> = true,
): AnchoredPosition {
  function update(): void {
    if (!toValue(active)) return
    const anchorEl = toValue(anchor)
    const floatingEl = toValue(floating)
    if (!anchorEl || !floatingEl || typeof window === 'undefined') return

    const rect = anchorEl.getBoundingClientRect()
    const width = floatingEl.offsetWidth
    const height = floatingEl.offsetHeight
    const gap = 4
    const rtl = getComputedStyle(anchorEl).direction === 'rtl'
    const requested = toValue(side)
    const cross = toValue(align)
    let physical: PhysicalSide =
      requested === 'start'
        ? rtl
          ? 'right'
          : 'left'
        : requested === 'end'
          ? rtl
            ? 'left'
            : 'right'
          : requested

    const room: Record<PhysicalSide, boolean> = {
      bottom: window.innerHeight - rect.bottom >= height + gap + 8,
      top: rect.top >= height + gap + 8,
      left: rect.left >= width + gap + 8,
      right: window.innerWidth - rect.right >= width + gap + 8,
    }
    if (!room[physical] && room[opposite[physical]]) physical = opposite[physical]

    let top = rect.bottom + gap
    let left = rect.left
    if (physical === 'top') top = rect.top - height - gap
    if (physical === 'left') left = rect.left - width - gap
    if (physical === 'right') left = rect.right + gap

    if (physical === 'top' || physical === 'bottom') {
      if (cross === 'center') left = rect.left + (rect.width - width) / 2
      else if (cross === 'end') left = rtl ? rect.left : rect.right - width
      else left = rtl ? rect.right - width : rect.left
    } else if (cross === 'center') top = rect.top + (rect.height - height) / 2
    else if (cross === 'end') top = rect.bottom - height
    else top = rect.top

    const maxLeft = Math.max(8, window.innerWidth - width - 8)
    const maxTop = Math.max(8, window.innerHeight - height - 8)
    floatingEl.style.position = 'fixed'
    floatingEl.style.inset = 'auto'
    floatingEl.style.margin = '0'
    floatingEl.style.left = `${Math.min(Math.max(8, left), maxLeft)}px`
    floatingEl.style.top = `${Math.min(Math.max(8, top), maxTop)}px`
  }

  function onReflow(): void {
    update()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
  }

  onScopeDispose(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', onReflow)
    window.removeEventListener('scroll', onReflow, true)
  })

  return { update }
}
