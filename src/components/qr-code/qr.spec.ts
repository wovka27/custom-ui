import { describe, expect, it } from 'vitest'
import { qrFigure, qrFormat, qrMatrix } from './qr'

function readFormat(cells: Uint8Array, size: number): number {
  const bit = (x: number, y: number): number => ((cells[y * size + x] ?? 0) === 0 ? 0 : 1)
  let bits = 0
  for (let i = 0; i <= 5; i += 1) bits |= bit(8, i) << i
  bits |= bit(8, 7) << 6
  bits |= bit(8, 8) << 7
  bits |= bit(7, 8) << 8
  for (let i = 9; i < 15; i += 1) bits |= bit(14 - i, 8) << i
  return bits
}

describe('qrFormat', () => {
  it('matches the published format strings for mask 0', () => {
    expect(qrFormat('L', 0)).toBe(0x77c4)
    expect(qrFormat('M', 0)).toBe(0x5412)
    expect(qrFormat('Q', 0)).toBe(0x355f)
    expect(qrFormat('H', 0)).toBe(0x1689)
  })
})

describe('qrMatrix', () => {
  it('draws the finder eyes and a valid format string', () => {
    const grid = qrMatrix('hello', 'M')
    expect(grid).not.toBeNull()
    if (!grid) return
    expect(grid.size).toBe(21)
    expect(grid.cells[0]).toBe(2)
    expect(grid.cells[6 * 21 + 6]).toBe(2)
    expect(grid.cells[1 * 21 + 1]).toBe(0)
    expect(grid.cells[3 * 21 + 3]).toBe(2)
    expect(grid.cells[7]).toBe(0)
    expect(readFormat(grid.cells, grid.size)).toBe(qrFormat('M', grid.mask))
    const dark = [...grid.cells].filter((cell) => cell !== 0).length
    expect(dark / (grid.size * grid.size)).toBeGreaterThan(0.35)
    expect(dark / (grid.size * grid.size)).toBeLessThan(0.7)
  })

  it('grows the symbol when the text no longer fits the first version', () => {
    const small = qrMatrix('hello', 'H')
    const large = qrMatrix('h'.repeat(80), 'H')
    expect(small?.size).toBe(21)
    expect(large?.size).toBeGreaterThan(21)
  })

  it('refuses a payload past version 10', () => {
    expect(qrMatrix('h'.repeat(400), 'L')).toBeNull()
  })

  it('stays stable for the same text', () => {
    const left = qrMatrix('berth:desk/18', 'Q')
    const right = qrMatrix('berth:desk/18', 'Q')
    expect(left?.cells).toEqual(right?.cells)
  })
})

describe('qrFigure', () => {
  it('draws dots for data modules and keeps a quiet margin', () => {
    const square = qrFigure('hello', 'M', 'square', 4)
    const dots = qrFigure('hello', 'M', 'dot', 4)
    expect(square?.view).toBe(29)
    expect(dots?.d.includes('a')).toBe(true)
    expect(square?.d.includes('a')).toBe(false)
    expect(qrFigure('h'.repeat(400), 'L', 'square', 4)).toBeNull()
  })
})
