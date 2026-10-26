export interface BeamFigure {
  width: number
  height: number
  d: string
  span: number
  dash: number
  gap: number
}

function clamp(value: number, min: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.max(min, value)
}

function unit(value: number): string {
  return value.toFixed(3)
}

/** One lap, starting on the top edge. Repeated so a dash can cross the join. */
function lap(left: number, top: number, right: number, bottom: number, curve: number): string {
  if (curve <= 0) {
    return `H ${unit(right)} V ${unit(bottom)} H ${unit(left)} V ${unit(top)}`
  }
  const radius = unit(curve)
  return [
    `H ${unit(right - curve)}`,
    `A ${radius} ${radius} 0 0 1 ${unit(right)} ${unit(top + curve)}`,
    `V ${unit(bottom - curve)}`,
    `A ${radius} ${radius} 0 0 1 ${unit(right - curve)} ${unit(bottom)}`,
    `H ${unit(left + curve)}`,
    `A ${radius} ${radius} 0 0 1 ${unit(left)} ${unit(bottom - curve)}`,
    `V ${unit(top + curve)}`,
    `A ${radius} ${radius} 0 0 1 ${unit(left + curve)} ${unit(top)}`,
  ].join(' ')
}

/**
 * A stroke along the center of the rim. The path traces the lap twice so the
 * moving dash stays one continuous mark when it crosses the start.
 */
export function beamFigure(
  boxWidth: number,
  boxHeight: number,
  thickness: number,
  radius: number,
  length: number,
): BeamFigure {
  const width = clamp(boxWidth, 0, 0)
  const height = clamp(boxHeight, 0, 0)
  const stroke = clamp(thickness, 0, 2)
  const outer = clamp(radius, 0, 0)
  const requested = clamp(length, 0, 0)
  const innerWidth = Math.max(0, width - stroke)
  const innerHeight = Math.max(0, height - stroke)
  const curve = Math.min(Math.max(0, outer - stroke / 2), innerWidth / 2, innerHeight / 2)
  const span = 2 * (innerWidth + innerHeight - 4 * curve) + 2 * Math.PI * curve
  if (innerWidth <= 0 || innerHeight <= 0 || span <= 0) {
    return { width, height, d: '', span: 0, dash: 0, gap: 0 }
  }
  const dash = Math.min(requested, span)
  const inset = stroke / 2
  const left = inset
  const top = inset
  const right = inset + innerWidth
  const bottom = inset + innerHeight
  const startX = curve > 0 ? left + curve : left
  const commands = lap(left, top, right, bottom, curve)
  return {
    width,
    height,
    d: `M ${unit(startX)} ${unit(top)} ${commands} ${commands}`,
    span,
    dash,
    gap: span - dash,
  }
}

/** A random reach between a short mark and the longest one that still fits the rim. */
export function beamReach(span: number, size: number, amount: number): number {
  const limit = Math.min(clamp(span, 0, 0), clamp(size, 0, 0))
  if (limit <= 0) return 0
  const t = Number.isFinite(amount) ? Math.min(1, Math.max(0, amount)) : 1
  const floor = Math.min(limit, Math.max(16, limit * 0.22))
  return floor + (limit - floor) * t
}
