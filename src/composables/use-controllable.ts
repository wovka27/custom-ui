import {
  computed,
  getCurrentInstance,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

interface UseControllableOptions<T> {
  value: MaybeRefOrGetter<T | undefined>
  defaultValue: MaybeRefOrGetter<T>
  onChange?: ((value: T) => void) | undefined
}

interface UseControllableReturn<T> {
  readonly value: ComputedRef<T>
  setValue: (next: T) => void
}

export function usePropWasPassed(name: string): () => boolean {
  const instance = getCurrentInstance()
  const kebab = name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
  return () => {
    const raw = instance?.vnode.props
    if (!raw) return false
    return Object.prototype.hasOwnProperty.call(raw, name) || Object.prototype.hasOwnProperty.call(raw, kebab)
  }
}

export function useModelWasPassed(): () => boolean {
  return usePropWasPassed('modelValue')
}

export function useControllable<T>(options: UseControllableOptions<T>): UseControllableReturn<T> {
  const internal = ref(toValue(options.defaultValue)) as Ref<T>

  const value = computed(() => {
    const controlled = toValue(options.value)
    return controlled === undefined ? internal.value : controlled
  })

  function setValue(next: T): void {
    if (toValue(options.value) === undefined) internal.value = next
    options.onChange?.(next)
  }

  return { value, setValue }
}
