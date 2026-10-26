export function shares(start: number, end: number): { start: number; end: number } {
  const left = Math.max(0, start)
  const right = Math.max(0, end)
  const total = left + right
  if (total === 0) return { start: 50, end: 50 }
  return { start: (left / total) * 100, end: (right / total) * 100 }
}
