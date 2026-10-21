import { onScopeDispose, readonly, ref, type Ref } from 'vue'
import type { UiTheme } from '@/types/common'

const STORAGE_KEY = 'ui-theme'
const theme = ref<UiTheme>('system')
let consumers = 0
let media: MediaQueryList | null = null

function isTheme(value: string | null): value is UiTheme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function apply(next: UiTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (next === 'system') {
    delete root.dataset.theme
    return
  }
  root.dataset.theme = next
}

function readStored(): UiTheme {
  if (typeof localStorage === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  return isTheme(stored) ? stored : 'system'
}

function onSystemChange(): void {
  if (theme.value === 'system') apply('system')
}

interface UseThemeReturn {
  theme: Readonly<Ref<UiTheme>>
  setTheme: (next: UiTheme) => void
}

export function useTheme(): UseThemeReturn {
  if (consumers === 0) {
    theme.value = readStored()
    apply(theme.value)
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', onSystemChange)
    }
  }

  consumers += 1
  onScopeDispose(() => {
    consumers = Math.max(0, consumers - 1)
    if (consumers === 0) {
      media?.removeEventListener('change', onSystemChange)
      media = null
    }
  })

  function setTheme(next: UiTheme): void {
    theme.value = next
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  }

  return { theme: readonly(theme), setTheme }
}
