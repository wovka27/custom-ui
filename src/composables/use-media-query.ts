import { onScopeDispose, readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export function useMediaQuery(query: MaybeRefOrGetter<string>): Readonly<Ref<boolean>> {
  const matches = ref(false)
  let media: MediaQueryList | null = null

  function sync(): void {
    matches.value = media?.matches ?? false
  }

  function stop(): void {
    media?.removeEventListener('change', sync)
    media = null
  }

  watch(
    () => toValue(query),
    (next) => {
      stop()
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
      media = window.matchMedia(next)
      sync()
      media.addEventListener('change', sync)
    },
    { immediate: true },
  )

  onScopeDispose(stop)

  return readonly(matches)
}
