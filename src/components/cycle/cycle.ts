export interface UiCycleState {
  id: string
  label: string
}

export function nextCycle(states: readonly UiCycleState[], current: string, direction: 1 | -1): string {
  if (states.length === 0) return current
  const index = states.findIndex((state) => state.id === current)
  const at = index < 0 ? 0 : index
  const next = states[(at + direction + states.length) % states.length]
  return next?.id ?? current
}
