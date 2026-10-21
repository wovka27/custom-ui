export interface Hsv {
  h: number
  s: number
  v: number
}

function byte(channel: number): number {
  return Math.min(255, Math.max(0, Math.round(channel)))
}

function pair(channel: number): string {
  return byte(channel).toString(16).padStart(2, '0')
}

export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split('')
      .map((char) => char + char)
      .join('')}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`
  return null
}

export function hexToHsv(value: string): Hsv | null {
  const hex = normalizeHex(value)
  if (!hex) return null
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return { h: hue, s: max === 0 ? 0 : delta / max, v: max }
}

export function hsvToHex(hsv: Hsv): string {
  const hue = ((hsv.h % 360) + 360) % 360
  const chroma = hsv.v * hsv.s
  const section = hue / 60
  const x = chroma * (1 - Math.abs((section % 2) - 1))
  const match = hsv.v - chroma
  const channels = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ][Math.floor(section)] ?? [0, 0, 0]
  const red = channels[0] ?? 0
  const green = channels[1] ?? 0
  const blue = channels[2] ?? 0
  return `#${pair((red + match) * 255)}${pair((green + match) * 255)}${pair((blue + match) * 255)}`
}
