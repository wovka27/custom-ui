export type QrLevel = 'L' | 'M' | 'Q' | 'H'

export type QrShape = 'square' | 'rounded' | 'dot' | 'diamond'

export interface QrGrid {
  size: number
  mask: number
  /** Row-major. 0 is light, 1 is a data module, 2 is a finder or alignment module. */
  cells: Uint8Array
}

export interface QrFigure {
  view: number
  d: string
}

type EcRow = readonly [ec: number, g1: number, d1: number, g2: number, d2: number]

const LEVELS: readonly QrLevel[] = ['L', 'M', 'Q', 'H']

const LEVEL_BITS: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 }

/** Error-correction blocks for versions 1–10. */
const ECC: readonly (readonly EcRow[])[] = [
  [
    [7, 1, 19, 0, 0],
    [10, 1, 16, 0, 0],
    [13, 1, 13, 0, 0],
    [17, 1, 9, 0, 0],
  ],
  [
    [10, 1, 34, 0, 0],
    [16, 1, 28, 0, 0],
    [22, 1, 22, 0, 0],
    [28, 1, 16, 0, 0],
  ],
  [
    [15, 1, 55, 0, 0],
    [26, 1, 44, 0, 0],
    [18, 2, 17, 0, 0],
    [22, 2, 13, 0, 0],
  ],
  [
    [20, 1, 80, 0, 0],
    [18, 2, 32, 0, 0],
    [26, 2, 24, 0, 0],
    [16, 4, 9, 0, 0],
  ],
  [
    [26, 1, 108, 0, 0],
    [24, 2, 43, 0, 0],
    [18, 2, 15, 2, 16],
    [22, 2, 11, 2, 12],
  ],
  [
    [18, 2, 68, 0, 0],
    [16, 4, 27, 0, 0],
    [24, 4, 19, 0, 0],
    [28, 4, 15, 0, 0],
  ],
  [
    [20, 2, 78, 0, 0],
    [18, 4, 31, 0, 0],
    [18, 2, 14, 4, 15],
    [26, 4, 13, 1, 14],
  ],
  [
    [24, 2, 97, 0, 0],
    [22, 2, 38, 2, 39],
    [22, 4, 18, 2, 19],
    [26, 4, 14, 2, 15],
  ],
  [
    [30, 2, 116, 0, 0],
    [22, 3, 36, 2, 37],
    [20, 4, 16, 4, 17],
    [24, 4, 12, 4, 13],
  ],
  [
    [18, 2, 68, 2, 69],
    [26, 4, 43, 1, 44],
    [24, 6, 19, 2, 20],
    [28, 6, 15, 2, 16],
  ],
]

const ALIGN: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
]

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)

function initField(): void {
  let value = 1
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value
    LOG[value] = i
    value <<= 1
    if ((value & 0x100) !== 0) value ^= 0x11d
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255] ?? 0
}

initField()

function mul(left: number, right: number): number {
  if (left === 0 || right === 0) return 0
  return EXP[(LOG[left] ?? 0) + (LOG[right] ?? 0)] ?? 0
}

const generators = new Map<number, Uint8Array>()

function generator(degree: number): Uint8Array {
  const cached = generators.get(degree)
  if (cached) return cached
  let poly = Uint8Array.of(1)
  for (let i = 0; i < degree; i += 1) {
    const next = new Uint8Array(poly.length + 1)
    const factor = EXP[i] ?? 0
    for (let j = 0; j < poly.length; j += 1) {
      const coeff = poly[j] ?? 0
      next[j] = (next[j] ?? 0) ^ coeff
      next[j + 1] = (next[j + 1] ?? 0) ^ mul(coeff, factor)
    }
    poly = next
  }
  generators.set(degree, poly)
  return poly
}

function remainder(data: Uint8Array, poly: Uint8Array): Uint8Array {
  const pad = poly.length - 1
  const msg = new Uint8Array(data.length + pad)
  msg.set(data)
  for (let i = 0; i < data.length; i += 1) {
    const factor = msg[i] ?? 0
    if (factor === 0) continue
    for (let j = 0; j < poly.length; j += 1) {
      msg[i + j] = (msg[i + j] ?? 0) ^ mul(poly[j] ?? 0, factor)
    }
  }
  return msg.subarray(data.length)
}

function levelIndex(level: QrLevel): number {
  const index = LEVELS.indexOf(level)
  return index < 0 ? 1 : index
}

function blocksFor(version: number, level: QrLevel): EcRow | null {
  return ECC[version - 1]?.[levelIndex(level)] ?? null
}

function capacity(version: number, level: QrLevel): number {
  const row = blocksFor(version, level)
  if (!row) return 0
  return row[1] * row[2] + row[3] * row[4]
}

function fits(version: number, level: QrLevel, byteLength: number): boolean {
  const bits = capacity(version, level) * 8
  const header = version <= 9 ? 12 : 20
  return header + byteLength * 8 <= bits
}

function chooseVersion(byteLength: number, level: QrLevel): number | null {
  for (let version = 1; version <= ECC.length; version += 1) {
    if (fits(version, level, byteLength)) return version
  }
  return null
}

function pushBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1)
}

function pack(bytes: Uint8Array, version: number, room: number): Uint8Array {
  const bits: number[] = []
  pushBits(bits, 0b0100, 4)
  pushBits(bits, bytes.length, version <= 9 ? 8 : 16)
  for (const byte of bytes) pushBits(bits, byte, 8)
  const cap = room * 8
  pushBits(bits, 0, Math.min(4, Math.max(0, cap - bits.length)))
  while (bits.length % 8 !== 0 && bits.length < cap) bits.push(0)
  const out = new Uint8Array(room)
  let index = 0
  for (let i = 0; i + 7 < bits.length && index < room; i += 8) {
    let value = 0
    for (let bit = 0; bit < 8; bit += 1) value = (value << 1) | (bits[i + bit] ?? 0)
    out[index] = value
    index += 1
  }
  let pad = 0
  for (; index < room; index += 1) {
    out[index] = pad % 2 === 0 ? 0xec : 0x11
    pad += 1
  }
  return out
}

function interleave(data: Uint8Array, row: EcRow): Uint8Array {
  const [ec, g1, d1, g2, d2] = row
  const parts: Uint8Array[] = []
  let offset = 0
  for (let i = 0; i < g1; i += 1) {
    parts.push(data.slice(offset, offset + d1))
    offset += d1
  }
  for (let i = 0; i < g2; i += 1) {
    parts.push(data.slice(offset, offset + d2))
    offset += d2
  }
  const poly = generator(ec)
  const checks = parts.map((part) => remainder(part, poly))
  const out: number[] = []
  const span = Math.max(d1, d2)
  for (let i = 0; i < span; i += 1) {
    for (const part of parts) {
      const byte = part[i]
      if (byte !== undefined) out.push(byte)
    }
  }
  for (let i = 0; i < ec; i += 1) {
    for (const check of checks) out.push(check[i] ?? 0)
  }
  return Uint8Array.from(out)
}

/** 15 format bits for an error level and a mask, already XOR-masked. */
export function qrFormat(level: QrLevel, mask: number): number {
  const data = (LEVEL_BITS[level] << 3) | (mask & 7)
  let rem = data
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  return ((data << 10) | (rem & 0x3ff)) ^ 0x5412
}

function versionBits(version: number): number {
  let rem = version
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  return (version << 12) | (rem & 0xfff)
}

function masked(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0
    case 1:
      return y % 2 === 0
    case 2:
      return x % 3 === 0
    case 3:
      return (x + y) % 3 === 0
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

function paint(
  cells: Uint8Array,
  taken: Uint8Array,
  size: number,
  x: number,
  y: number,
  dark: boolean,
): void {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const index = y * size + x
  cells[index] = dark ? 2 : 0
  taken[index] = 1
}

function finder(cells: Uint8Array, taken: Uint8Array, size: number, ox: number, oy: number): void {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const edge = dx < 0 || dy < 0 || dx > 6 || dy > 6
      const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6
      const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
      paint(cells, taken, size, ox + dx, oy + dy, !edge && (ring || core))
    }
  }
}

function alignment(
  cells: Uint8Array,
  taken: Uint8Array,
  size: number,
  cx: number,
  cy: number,
): void {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      paint(cells, taken, size, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }
  }
}

function formatPoints(size: number): readonly (readonly [number, number])[] {
  const points: [number, number][] = []
  for (let i = 0; i <= 5; i += 1) points.push([8, i])
  points.push([8, 7], [8, 8], [7, 8])
  for (let i = 9; i < 15; i += 1) points.push([14 - i, 8])
  for (let i = 0; i < 8; i += 1) points.push([size - 1 - i, 8])
  for (let i = 8; i < 15; i += 1) points.push([8, size - 15 + i])
  return points
}

function writeFormat(cells: Uint8Array, size: number, bits: number): void {
  formatPoints(size).forEach(([x, y], index) => {
    const dark = ((bits >>> (index % 15)) & 1) === 1
    cells[y * size + x] = dark ? 2 : 0
  })
}

function reserveFormat(cells: Uint8Array, taken: Uint8Array, size: number): void {
  for (const [x, y] of formatPoints(size)) {
    const index = y * size + x
    cells[index] = 0
    taken[index] = 1
  }
}

function writeVersion(cells: Uint8Array, taken: Uint8Array, size: number, version: number): void {
  if (version < 7) return
  const bits = versionBits(version)
  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >>> i) & 1) === 1
    const a = size - 11 + (i % 3)
    const b = Math.floor(i / 3)
    paint(cells, taken, size, a, b, dark)
    paint(cells, taken, size, b, a, dark)
  }
}

function placeData(cells: Uint8Array, taken: Uint8Array, size: number, words: Uint8Array): void {
  let bit = 0
  const total = words.length * 8
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    const column = right
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = column - j
        const upward = ((column + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        const index = y * size + x
        if (taken[index]) continue
        const on = bit < total && ((words[bit >>> 3] ?? 0) & (1 << (7 - (bit & 7)))) !== 0
        cells[index] = on ? 1 : 0
        bit += 1
      }
    }
  }
}

function penalty(cells: Uint8Array, size: number): number {
  const darkAt = (x: number, y: number): boolean => (cells[y * size + x] ?? 0) !== 0
  let score = 0
  const run = (horizontal: boolean): void => {
    for (let a = 0; a < size; a += 1) {
      let count = 1
      for (let b = 1; b < size; b += 1) {
        const same = horizontal
          ? darkAt(b, a) === darkAt(b - 1, a)
          : darkAt(a, b) === darkAt(a, b - 1)
        if (!same) {
          count = 1
          continue
        }
        count += 1
        if (count === 5) score += 3
        else if (count > 5) score += 1
      }
    }
  }
  run(true)
  run(false)
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const value = darkAt(x, y)
      if (
        value === darkAt(x + 1, y) &&
        value === darkAt(x, y + 1) &&
        value === darkAt(x + 1, y + 1)
      ) {
        score += 3
      }
    }
  }
  const finder = [true, false, true, true, true, false, true]
  const scan = (horizontal: boolean): void => {
    for (let a = 0; a < size; a += 1) {
      for (let b = 0; b <= size - 11; b += 1) {
        const read = (offset: number): boolean =>
          horizontal ? darkAt(b + offset, a) : darkAt(a, b + offset)
        let forward = true
        let backward = true
        for (let k = 0; k < 7; k += 1) {
          if (read(k) !== finder[k]) forward = false
          if (read(k + 4) !== finder[k]) backward = false
        }
        const lead = !read(7) && !read(8) && !read(9) && !read(10)
        const tail = !read(0) && !read(1) && !read(2) && !read(3)
        if ((forward && lead) || (backward && tail)) score += 40
      }
    }
  }
  scan(true)
  scan(false)
  let dark = 0
  for (const cell of cells) if (cell !== 0) dark += 1
  const modules = size * size
  const balance = Math.abs(Math.ceil(dark * 100 / modules / 5) - 10)
  score += balance * 10
  return score
}

function applyMask(cells: Uint8Array, taken: Uint8Array, size: number, mask: number): void {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x
      if (taken[index] || !masked(mask, x, y)) continue
      cells[index] = cells[index] ? 0 : 1
    }
  }
}

/** Encode `value` as a QR symbol, or return null when it does not fit versions 1–10. */
export function qrMatrix(value: string, level: QrLevel = 'M'): QrGrid | null {
  const bytes = new TextEncoder().encode(value)
  const version = chooseVersion(bytes.length, level)
  const row = version === null ? null : blocksFor(version, level)
  if (version === null || row === null) return null
  const size = 17 + version * 4
  const words = interleave(pack(bytes, version, capacity(version, level)), row)
  const base = new Uint8Array(size * size)
  const taken = new Uint8Array(size * size)
  finder(base, taken, size, 0, 0)
  finder(base, taken, size, size - 7, 0)
  finder(base, taken, size, 0, size - 7)
  for (const y of ALIGN[version - 1] ?? []) {
    for (const x of ALIGN[version - 1] ?? []) {
      if (taken[y * size + x]) continue
      alignment(base, taken, size, x, y)
    }
  }
  for (let i = 0; i < size; i += 1) {
    if (!taken[6 * size + i]) paint(base, taken, size, i, 6, i % 2 === 0)
    if (!taken[i * size + 6]) paint(base, taken, size, 6, i, i % 2 === 0)
  }
  paint(base, taken, size, 8, size - 8, true)
  writeVersion(base, taken, size, version)
  reserveFormat(base, taken, size)
  placeData(base, taken, size, words)
  let bestMask = 0
  let bestScore = Number.POSITIVE_INFINITY
  let best = base
  for (let mask = 0; mask < 8; mask += 1) {
    const cells = base.slice()
    applyMask(cells, taken, size, mask)
    writeFormat(cells, size, qrFormat(level, mask))
    const score = penalty(cells, size)
    if (score < bestScore) {
      bestScore = score
      bestMask = mask
      best = cells
    }
  }
  return { size, mask: bestMask, cells: best }
}

function unit(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  return String(rounded)
}

function square(x: number, y: number): string {
  return `M${unit(x)} ${unit(y)}h1v1h-1z`
}

function rounded(x: number, y: number): string {
  const radius = 0.32
  const inset = 0.08
  const originX = x + inset
  const originY = y + inset
  const span = 1 - inset * 2
  const side = span - radius * 2
  return [
    `M${unit(originX + radius)} ${unit(originY)}`,
    `h${unit(side)}`,
    `a${unit(radius)} ${unit(radius)} 0 0 1 ${unit(radius)} ${unit(radius)}`,
    `v${unit(side)}`,
    `a${unit(radius)} ${unit(radius)} 0 0 1 ${unit(-radius)} ${unit(radius)}`,
    `h${unit(-side)}`,
    `a${unit(radius)} ${unit(radius)} 0 0 1 ${unit(-radius)} ${unit(-radius)}`,
    `v${unit(-side)}`,
    `a${unit(radius)} ${unit(radius)} 0 0 1 ${unit(radius)} ${unit(-radius)}z`,
  ].join('')
}

function dot(x: number, y: number): string {
  const radius = 0.38
  const cx = x + 0.5
  const cy = y + 0.5
  return `M${unit(cx - radius)} ${unit(cy)}a${unit(radius)} ${unit(radius)} 0 1 0 ${unit(radius * 2)} 0a${unit(radius)} ${unit(radius)} 0 1 0 ${unit(-radius * 2)} 0`
}

function diamond(x: number, y: number): string {
  const cx = x + 0.5
  const cy = y + 0.5
  const reach = 0.46
  return `M${unit(cx)} ${unit(cy - reach)}l${unit(reach)} ${unit(reach)}l${unit(-reach)} ${unit(reach)}l${unit(-reach)} ${unit(-reach)}z`
}

function isFinder(x: number, y: number, size: number): boolean {
  const box = (ox: number, oy: number): boolean => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
  return box(0, 0) || box(size - 7, 0) || box(0, size - 7)
}

/** Build the module path, including the quiet margin. Null when the value does not fit. */
export function qrFigure(
  value: string,
  level: QrLevel,
  shape: QrShape,
  quiet: number,
): QrFigure | null {
  const grid = qrMatrix(value, level)
  if (!grid) return null
  const parts: string[] = []
  for (let y = 0; y < grid.size; y += 1) {
    for (let x = 0; x < grid.size; x += 1) {
      const cell = grid.cells[y * grid.size + x] ?? 0
      if (cell === 0) continue
      const px = x + quiet
      const py = y + quiet
      const eye = cell === 2 || isFinder(x, y, grid.size)
      if (shape === 'square' || eye) parts.push(square(px, py))
      else if (shape === 'rounded') parts.push(rounded(px, py))
      else if (shape === 'dot') parts.push(dot(px, py))
      else parts.push(diamond(px, py))
    }
  }
  return { view: grid.size + quiet * 2, d: parts.join('') }
}
