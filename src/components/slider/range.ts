export type SliderEdge = 'low' | 'high'

export function slideRange(
  edge: SliderEdge,
  next: number,
  low: number,
  high: number,
): { edge: SliderEdge; value: [number, number] } {
  if (edge === 'low' && next > high) return { edge: 'high', value: [high, next] }
  if (edge === 'high' && next < low) return { edge: 'low', value: [next, low] }
  if (edge === 'low') return { edge, value: [next, high] }
  return { edge, value: [low, next] }
}
