export function sparkPoints(values: readonly number[], width: number, height: number): string {
  if (values.length === 0 || width <= 0 || height <= 0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 2) - 1
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}
