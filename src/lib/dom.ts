export function isNode(value: EventTarget | null): value is Node {
  return value instanceof Node
}

export function nextEnabledIndex(
  size: number,
  start: number,
  step: 1 | -1,
  isDisabled: (index: number) => boolean,
): number {
  if (size === 0) return -1
  for (let offset = 0; offset < size; offset += 1) {
    const index = (start + offset * step + size) % size
    if (!isDisabled(index)) return index
  }
  return -1
}
