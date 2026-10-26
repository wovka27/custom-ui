import { describe, expect, it } from 'vitest'
import { beamFigure, beamReach } from './beam'

describe('beamFigure', () => {
  it('follows the center of a rounded rim and repeats the lap', () => {
    const figure = beamFigure(100, 50, 2, 4, 30)
    const curve = 3
    const span = 2 * (98 + 48 - 4 * curve) + 2 * Math.PI * curve
    expect(figure.span).toBeCloseTo(span, 5)
    expect(figure.dash).toBe(30)
    expect(figure.gap).toBeCloseTo(span - 30, 5)
    expect(figure.d.startsWith('M 4.000 1.000')).toBe(true)
    expect(figure.d.match(/A /g)).toHaveLength(8)
  })

  it('turns a square corner without leaving the box', () => {
    const figure = beamFigure(40, 20, 2, 0, 10)
    expect(figure.span).toBeCloseTo(2 * (38 + 18), 5)
    expect(figure.d.startsWith('M 1.000 1.000')).toBe(true)
    expect(figure.d.includes('A ')).toBe(false)
    expect(figure.d.match(/H 39\.000/g)).toHaveLength(2)
  })

  it('keeps a large radius inside the rim and caps the dash at one lap', () => {
    const figure = beamFigure(30, 20, 2, 100, 500)
    const curve = 9
    const span = 2 * (28 + 18 - 4 * curve) + 2 * Math.PI * curve
    expect(figure.span).toBeCloseTo(span, 5)
    expect(figure.dash).toBeCloseTo(span, 5)
    expect(figure.gap).toBe(0)
  })

  it('shortens a random reach and never passes the rim', () => {
    expect(beamReach(1000, 120, 0)).toBeCloseTo(26.4, 5)
    expect(beamReach(1000, 120, 1)).toBe(120)
    expect(beamReach(1000, 120, 0.5)).toBeCloseTo(73.2, 5)
    expect(beamReach(40, 120, 1)).toBe(40)
    expect(beamReach(40, 10, 0)).toBe(10)
    expect(beamReach(0, 120, 1)).toBe(0)
    expect(beamReach(1000, 120, 4)).toBe(120)
    expect(beamReach(1000, 120, Number.NaN)).toBe(120)
  })

  it('returns nothing for an empty box', () => {
    expect(beamFigure(0, 20, 2, 4, 30)).toEqual({
      width: 0,
      height: 20,
      d: '',
      span: 0,
      dash: 0,
      gap: 0,
    })
  })
})
