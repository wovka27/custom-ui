export type DialogCloseGuard = () => boolean | Promise<boolean>

interface DialogLayer {
  id: string
  pending: boolean
  generation: number
  guard?: DialogCloseGuard
  resolve?: (allowed: boolean) => void
}

const layers: DialogLayer[] = []
let pumping = false
let epoch = 0

export function resetDialogStack(): void {
  epoch += 1
  pumping = false
  layers.length = 0
}

export function activateDialog(id: string): void {
  const index = layers.findIndex((layer) => layer.id === id)
  if (index === -1) {
    layers.push({ id, pending: false, generation: 0 })
    return
  }
  if (index === layers.length - 1) return
  const [layer] = layers.splice(index, 1)
  if (layer) layers.push(layer)
}

export function releaseDialog(id: string): void {
  const index = layers.findIndex((layer) => layer.id === id)
  if (index === -1) return
  const [layer] = layers.splice(index, 1)
  if (!layer) return
  layer.generation += 1
  layer.pending = false
  const resolve = layer.resolve
  layer.resolve = undefined
  layer.guard = undefined
  resolve?.(false)
  void pump()
}

export function cancelDialogClose(id: string): void {
  const layer = layers.find((item) => item.id === id)
  if (!layer) return
  layer.generation += 1
  layer.pending = false
  layer.guard = undefined
  const resolve = layer.resolve
  layer.resolve = undefined
  resolve?.(false)
}

export function requestDialogClose(id: string, guard?: DialogCloseGuard): Promise<boolean> {
  const layer = layers.find((item) => item.id === id)
  if (!layer) return Promise.resolve(true)
  if (layer.resolve) {
    layer.generation += 1
    layer.resolve(false)
    layer.resolve = undefined
  }
  layer.generation += 1
  layer.pending = true
  layer.guard = guard
  const promise = new Promise<boolean>((resolve) => {
    layer.resolve = resolve
  })
  void pump()
  return promise
}

async function runGuard(layer: DialogLayer, generation: number): Promise<boolean> {
  try {
    const result = await layer.guard?.()
    if (layer.generation !== generation) return false
    return result !== false
  } catch {
    return false
  }
}

async function pump(): Promise<void> {
  if (pumping) return
  pumping = true
  const run = epoch
  try {
    for (;;) {
      if (epoch !== run) return
      const top = layers.at(-1)
      if (!top?.pending) break
      const generation = top.generation
      const allowed = await runGuard(top, generation)
      if (epoch !== run) return
      if (top.generation !== generation) continue
      top.pending = false
      const resolve = top.resolve
      top.resolve = undefined
      top.guard = undefined
      if (!allowed) {
        resolve?.(false)
        break
      }
      const index = layers.indexOf(top)
      if (index >= 0) layers.splice(index, 1)
      resolve?.(true)
      await Promise.resolve()
    }
  } finally {
    if (epoch === run) {
      pumping = false
      if (layers.at(-1)?.pending) void pump()
    }
  }
}
