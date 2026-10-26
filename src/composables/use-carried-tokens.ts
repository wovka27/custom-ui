import { onScopeDispose, ref, watch, type Ref } from 'vue'
import { useMediaQuery } from '@/composables/use-media-query'
import { tokenOverrides } from '@/styles/token-override'

export function readCarriedTokens(
  style: Pick<CSSStyleDeclaration, 'getPropertyValue'>,
): Record<string, string> {
  const next: Record<string, string> = {}
  for (const token of tokenOverrides.tokens) {
    const value = style.getPropertyValue(token.name).trim()
    if (value.length > 0) next[token.name] = value
  }
  return next
}

export function useCarriedTokens(
  anchor: Readonly<Ref<HTMLElement | null>>,
): Ref<Record<string, string>> {
  const carried = ref<Record<string, string>>({})
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  let observer: MutationObserver | null = null

  function read(): void {
    const node = anchor.value
    if (!node || typeof window === 'undefined') return
    carried.value = readCarriedTokens(window.getComputedStyle(node))
  }

  function observe(): void {
    observer?.disconnect()
    observer = null
    const node = anchor.value
    if (!node || typeof MutationObserver === 'undefined') return
    observer = new MutationObserver(() => {
      read()
    })
    let current = node.parentElement
    while (current) {
      observer.observe(current, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-theme'],
      })
      current = current.parentElement
    }
  }

  watch(anchor, () => {
    read()
    observe()
  })

  watch(prefersDark, () => {
    read()
  })

  onScopeDispose(() => {
    observer?.disconnect()
  })

  return carried
}
