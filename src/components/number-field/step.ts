export function clampNumber(value: number, min?: number, max?: number): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

export function nextStep(
  current: number,
  direction: 1 | -1,
  step: number,
  min?: number,
  max?: number,
): number {
  const safeStep = step > 0 ? step : 1
  const base = Number.isFinite(current) ? current : (min ?? 0)
  const moved = Number((base + direction * safeStep).toFixed(6))
  return clampNumber(moved, min, max)
}
