import { onScopeDispose, shallowRef, watch, type Ref } from 'vue'
import {
  collectQueries,
  isOptionList,
  type FormAsyncState,
  type FormNode,
  type FormQueryError,
  type FormQueryMap,
  type FormValues,
} from './schema'

interface QueryRuntime {
  queries: Readonly<Ref<FormQueryMap>>
  settle(): Promise<void>
  restart(): void
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function queryError(error: unknown): FormQueryError {
  if (error instanceof Error && error.message.length > 0 && error.name !== 'AbortError') {
    return { message: error.message }
  }
  return { message: 'Could not load this part of the form.' }
}

function keptData(state: FormAsyncState<unknown> | undefined): unknown {
  if (!state || state.status === 'idle') return undefined
  return state.data
}

function signatureFor(watchNames: readonly string[], values: FormValues): string {
  return JSON.stringify(watchNames.map((name) => values[name] ?? null))
}

export function useFormQueries(
  schema: () => readonly FormNode[],
  values: Ref<FormValues>,
  clearValue: (name: string) => void,
): QueryRuntime {
  const queries = shallowRef<FormQueryMap>({})
  const signatures = new Map<string, string>()
  const active = new Map<string, { controller: AbortController; generation: number }>()
  const inflight = new Map<string, Promise<void>>()
  let generation = 0

  function write(key: string, state: FormAsyncState<unknown>): void {
    queries.value = { ...queries.value, [key]: state }
  }

  function drop(key: string): void {
    if (!(key in queries.value)) return
    const next: Record<string, FormAsyncState<unknown>> = {}
    for (const [name, state] of Object.entries(queries.value)) {
      if (name !== key && state) next[name] = state
    }
    queries.value = next
  }

  function cancel(key: string): void {
    const current = active.get(key)
    if (!current) return
    current.controller.abort()
    active.delete(key)
  }

  async function run(binding: ReturnType<typeof collectQueries>[number]): Promise<void> {
    cancel(binding.key)
    const token = ++generation
    const controller = new globalThis.AbortController()
    active.set(binding.key, { controller, generation: token })
    const previous = queries.value[binding.key]
    const stale = keptData(previous)
    if (binding.optionsFor && previous?.status === 'success') {
      const name = binding.optionsFor
      queueMicrotask(() => {
        clearValue(name)
      })
    }
    write(
      binding.key,
      stale === undefined ? { status: 'pending' } : { status: 'pending', data: stale },
    )
    try {
      const data = await binding.load({ values: values.value, signal: controller.signal })
      if (controller.signal.aborted || active.get(binding.key)?.generation !== token) return
      if (binding.optionsFor) {
        if (!isOptionList(data)) {
          write(binding.key, {
            status: 'error',
            error: { message: 'Options could not be read.' },
            ...(stale === undefined ? {} : { data: stale }),
          })
          return
        }
        write(binding.key, { status: 'success', data })
        const current = values.value[binding.optionsFor]
        const allowed = current == null || data.some((option) => option.value === current)
        if (!allowed) clearValue(binding.optionsFor)
        return
      }
      write(binding.key, { status: 'success', data })
    } catch (error) {
      if (
        controller.signal.aborted ||
        isAbortError(error) ||
        active.get(binding.key)?.generation !== token
      ) {
        return
      }
      write(binding.key, {
        status: 'error',
        error: queryError(error),
        ...(stale === undefined ? {} : { data: stale }),
      })
    } finally {
      if (active.get(binding.key)?.generation === token) active.delete(binding.key)
    }
  }

  function sync(): void {
    const bindings = collectQueries(schema())
    const live = new Set(bindings.map((binding) => binding.key))
    for (const key of signatures.keys()) {
      if (live.has(key)) continue
      cancel(key)
      signatures.delete(key)
      drop(key)
    }
    for (const binding of bindings) {
      const signature = signatureFor(binding.watch, values.value)
      if (signatures.get(binding.key) === signature && queries.value[binding.key]) continue
      signatures.set(binding.key, signature)
      const task = run(binding)
      inflight.set(binding.key, task)
      void task.finally(() => {
        if (inflight.get(binding.key) === task) inflight.delete(binding.key)
      })
    }
  }

  watch(
    () =>
      collectQueries(schema())
        .map((binding) => `${binding.key}:${signatureFor(binding.watch, values.value)}`)
        .join('|'),
    sync,
    { immediate: true, flush: 'sync' },
  )

  onScopeDispose(() => {
    for (const key of active.keys()) cancel(key)
    inflight.clear()
  })

  async function settle(): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const pending = [...inflight.values()]
      if (pending.length === 0) return
      await Promise.all(pending)
    }
  }

  function restart(): void {
    signatures.clear()
    sync()
  }

  return { queries, settle, restart }
}
