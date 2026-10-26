import raw from './design-score.json'

const grounds = ['void', 'paper', 'fog'] as const
const shapes = ['square', 'cut', 'soft', 'round'] as const
const densities = ['tight', 'even', 'open'] as const
const motions = ['still', 'brief', 'measured'] as const
const elevations = ['flat', 'lift'] as const
const voices = ['plain', 'mono'] as const
type ScoreAxis =
  'name' | 'hue' | 'chroma' | 'ground' | 'shape' | 'density' | 'motion' | 'elevation' | 'voice'

export type ScoreGround = (typeof grounds)[number]
export type ScoreShape = (typeof shapes)[number]
export type ScoreDensity = (typeof densities)[number]
export type ScoreMotion = (typeof motions)[number]
export type ScoreElevation = (typeof elevations)[number]
export type ScoreVoice = (typeof voices)[number]
export type ScoreScheme = 'light' | 'dark'

export interface DesignScore {
  readonly name: string
  readonly hue: number
  readonly chroma: number
  readonly ground: ScoreGround
  readonly shape: ScoreShape
  readonly density: ScoreDensity
  readonly motion: ScoreMotion
  readonly elevation: ScoreElevation
  readonly voice: ScoreVoice
}

export interface DesignScoreDocument {
  readonly kit: string
  readonly version: number
  readonly prompt: string
  readonly rules: readonly string[]
  readonly axes: Readonly<Record<ScoreAxis, string>>
  readonly examples: readonly DesignScore[]
}

export interface CompiledScore {
  readonly light: Readonly<Record<string, string>>
  readonly dark: Readonly<Record<string, string>>
  readonly shared: Readonly<Record<string, string>>
}

interface GroundStop {
  readonly bg: number
  readonly fg: number
  readonly muted: number
  readonly subtle: number
  readonly surface: number
  readonly raised: number
  readonly border: number
  readonly borderStrong: number
  readonly tint: number
}

const groundStops: Record<ScoreGround, { readonly light: GroundStop; readonly dark: GroundStop }> =
  {
    paper: {
      light: {
        bg: 0.985,
        fg: 0.21,
        muted: 0.48,
        subtle: 0.965,
        surface: 0.995,
        raised: 0.955,
        border: 0.9,
        borderStrong: 0.72,
        tint: 0.15,
      },
      dark: {
        bg: 0.16,
        fg: 0.96,
        muted: 0.72,
        subtle: 0.2,
        surface: 0.19,
        raised: 0.24,
        border: 0.32,
        borderStrong: 0.55,
        tint: 0.2,
      },
    },
    void: {
      light: {
        bg: 0.93,
        fg: 0.16,
        muted: 0.42,
        subtle: 0.9,
        surface: 0.96,
        raised: 0.88,
        border: 0.82,
        borderStrong: 0.62,
        tint: 0.08,
      },
      dark: {
        bg: 0.1,
        fg: 0.97,
        muted: 0.7,
        subtle: 0.14,
        surface: 0.13,
        raised: 0.18,
        border: 0.26,
        borderStrong: 0.48,
        tint: 0.12,
      },
    },
    fog: {
      light: {
        bg: 0.96,
        fg: 0.28,
        muted: 0.55,
        subtle: 0.94,
        surface: 0.98,
        raised: 0.92,
        border: 0.86,
        borderStrong: 0.7,
        tint: 0.45,
      },
      dark: {
        bg: 0.24,
        fg: 0.94,
        muted: 0.78,
        subtle: 0.28,
        surface: 0.27,
        raised: 0.32,
        border: 0.4,
        borderStrong: 0.62,
        tint: 0.35,
      },
    },
  }

const shapeStops: Record<
  ScoreShape,
  {
    readonly sm: string
    readonly md: string
    readonly lg: string
    readonly full: string
    readonly button: string
    readonly control: string
    readonly table: string
    readonly scroll: string
  }
> = {
  square: {
    sm: '0px',
    md: '0px',
    lg: '0px',
    full: '0px',
    button: '0px',
    control: '0px',
    table: '0px',
    scroll: '0px',
  },
  cut: {
    sm: '2px',
    md: '2px',
    lg: '2px',
    full: '2px',
    button: '2px',
    control: '2px',
    table: '2px',
    scroll: '2px',
  },
  soft: {
    sm: '2px',
    md: '4px',
    lg: '6px',
    full: '999px',
    button: '0.75rem',
    control: '4px',
    table: '6px',
    scroll: '999px',
  },
  round: {
    sm: '999px',
    md: '999px',
    lg: '999px',
    full: '999px',
    button: '999px',
    control: '999px',
    table: '999px',
    scroll: '999px',
  },
}

const plainSans = "'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
const plainDisplay = "'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif"
const monoStack = "'Cascadia Mono', ui-monospace, monospace"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(key: string, detail: string): never {
  throw new Error(`Score field "${key}" ${detail}`)
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], key: string): T {
  if (typeof value !== 'string') fail(key, `must be one of ${allowed.join(', ')}.`)
  const found = allowed.find((item) => item === value)
  if (found === undefined) fail(key, `must be one of ${allowed.join(', ')}.`)
  return found
}

function readName(value: unknown): string {
  if (typeof value !== 'string') fail('name', 'must be 1 to 48 characters.')
  const name = value.trim()
  if (name.length === 0 || name.length > 48) fail('name', 'must be 1 to 48 characters.')
  if (/[\n\r]/.test(name)) fail('name', 'must be one line.')
  return name
}

function readHue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 360) {
    fail('hue', 'must be a number from 0 to 360.')
  }
  return value
}

function readChroma(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0.04 || value > 0.2) {
    fail('chroma', 'must be a number from 0.04 to 0.2.')
  }
  return value
}

export function parseScore(value: unknown): DesignScore {
  if (!isRecord(value)) throw new Error('A score must be an object.')
  return {
    name: readName(value.name),
    hue: readHue(value.hue),
    chroma: readChroma(value.chroma),
    ground: readEnum(value.ground, grounds, 'ground'),
    shape: readEnum(value.shape, shapes, 'shape'),
    density: readEnum(value.density, densities, 'density'),
    motion: readEnum(value.motion, motions, 'motion'),
    elevation: readEnum(value.elevation, elevations, 'elevation'),
    voice: readEnum(value.voice, voices, 'voice'),
  }
}

function readAxis(axes: Record<string, unknown>, key: ScoreAxis): string {
  const detail = axes[key]
  if (typeof detail !== 'string' || detail.length === 0) {
    throw new Error(`Score axis "${key}" must explain itself.`)
  }
  return detail
}

function readRules(value: unknown[]): readonly string[] {
  const rules: string[] = []
  for (const item of value) {
    if (typeof item !== 'string' || item.length === 0) {
      throw new Error('Score rules must be non-empty strings.')
    }
    rules.push(item)
  }
  if (rules.length === 0) throw new Error('Score rules must be non-empty strings.')
  return rules
}

function readDocument(value: unknown): DesignScoreDocument {
  if (!isRecord(value) || !Array.isArray(value.examples) || !Array.isArray(value.rules)) {
    throw new Error('design-score.json is not a score document.')
  }
  if (!isRecord(value.axes)) throw new Error('design-score.json is missing axes.')
  const axes = {
    name: readAxis(value.axes, 'name'),
    hue: readAxis(value.axes, 'hue'),
    chroma: readAxis(value.axes, 'chroma'),
    ground: readAxis(value.axes, 'ground'),
    shape: readAxis(value.axes, 'shape'),
    density: readAxis(value.axes, 'density'),
    motion: readAxis(value.axes, 'motion'),
    elevation: readAxis(value.axes, 'elevation'),
    voice: readAxis(value.axes, 'voice'),
  }
  const rules = readRules(value.rules)
  const version = value.version
  if (typeof version !== 'number' || !Number.isFinite(version)) {
    throw new Error('design-score.json version must be a number.')
  }
  const kit = value.kit
  const prompt = value.prompt
  if (typeof kit !== 'string' || kit.length === 0)
    throw new Error('A score document needs a kit name.')
  if (typeof prompt !== 'string' || prompt.length === 0)
    throw new Error('A score document needs a prompt.')
  return {
    kit,
    version,
    prompt,
    rules,
    axes,
    examples: value.examples.map((item) => parseScore(item)),
  }
}

export const designScoreDocument: DesignScoreDocument = readDocument(raw)
export const designScoreJson = `${JSON.stringify(raw, null, 2)}\n`

function exampleNamed(name: string): DesignScore {
  const found = designScoreDocument.examples.find((item) => item.name === name)
  if (found === undefined) throw new Error(`design-score.json is missing the ${name} score.`)
  return found
}

export const ledgerScore: DesignScore = exampleNamed('Ledger')

function wrapHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}

function pullHue(anchor: number, toward: number, amount: number): number {
  let delta = wrapHue(toward) - wrapHue(anchor)
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return wrapHue(anchor + delta * amount)
}

function rem(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  return `${rounded}rem`
}

function oklch(lightness: number, chroma: number, hue: number, alpha?: number): string {
  const body = `${lightness.toFixed(3)} ${Math.max(0, chroma).toFixed(3)} ${Math.round(wrapHue(hue))}`
  if (alpha === undefined) return `oklch(${body})`
  return `oklch(${body} / ${alpha})`
}

function colors(score: DesignScore, scheme: ScoreScheme): Record<string, string> {
  const stop = groundStops[score.ground][scheme]
  const hue = score.hue
  const neutral = score.chroma * stop.tint
  const accent = score.chroma
  const danger = pullHue(25, hue, 0.22)
  const success = pullHue(155, hue, 0.22)
  const warning = pullHue(82, hue, 0.22)
  const info = pullHue(230, hue, 0.5)
  const light = scheme === 'light'
  const status = (
    tone: number,
    lightness: number,
    hover: number,
    foreground: number,
    subtle: number,
  ) => ({
    main: oklch(lightness, accent, tone),
    hover: oklch(hover, accent, tone),
    fg: oklch(foreground, Math.min(accent, 0.04), tone),
    subtle: oklch(subtle, accent * (light ? 0.22 : 0.35), tone),
  })
  const dangerTone = status(
    danger,
    light ? 0.5 : 0.74,
    light ? 0.44 : 0.8,
    light ? 0.99 : 0.2,
    light ? 0.95 : 0.32,
  )
  const successTone = status(
    success,
    light ? 0.46 : 0.78,
    light ? 0.4 : 0.84,
    light ? 0.99 : 0.2,
    light ? 0.95 : 0.32,
  )
  const warningTone = status(
    warning,
    light ? 0.62 : 0.82,
    light ? 0.56 : 0.86,
    light ? 0.25 : 0.22,
    light ? 0.96 : 0.34,
  )
  const infoTone = status(
    info,
    light ? 0.48 : 0.8,
    light ? 0.42 : 0.86,
    light ? 0.99 : 0.2,
    light ? 0.95 : 0.32,
  )
  const accentMain = oklch(light ? 0.48 : 0.84, accent, hue)
  const shadow =
    score.elevation === 'flat'
      ? { sm: 'none', md: 'none', pop: 'none' }
      : {
          sm: `0 1px 2px ${oklch(stop.fg, neutral, hue, light ? 0.06 : 0.35)}`,
          md: `0 8px 24px ${oklch(stop.fg, neutral, hue, light ? 0.08 : 0.4)}`,
          pop: `0 16px 40px ${oklch(stop.fg, neutral, hue, light ? 0.1 : 0.5)}`,
        }
  return {
    '--ui-color-bg': oklch(stop.bg, neutral, hue),
    '--ui-color-fg': oklch(stop.fg, neutral, hue),
    '--ui-color-muted': oklch(stop.muted, neutral, hue),
    '--ui-color-subtle': oklch(stop.subtle, neutral, hue),
    '--ui-color-surface': oklch(stop.surface, neutral, hue),
    '--ui-color-surface-raised': oklch(stop.raised, neutral, hue),
    '--ui-color-border': oklch(stop.border, neutral, hue),
    '--ui-color-border-strong': oklch(stop.borderStrong, neutral * 1.4, hue),
    '--ui-color-ink': oklch(stop.fg, neutral, hue),
    '--ui-color-paper': oklch(stop.surface, neutral, hue),
    '--ui-color-accent': accentMain,
    '--ui-color-accent-hover': oklch(light ? 0.42 : 0.9, accent, hue),
    '--ui-color-accent-fg': oklch(light ? 0.99 : stop.bg, Math.min(accent, 0.03), hue),
    '--ui-color-accent-subtle': oklch(light ? 0.95 : 0.28, accent * (light ? 0.22 : 0.4), hue),
    '--ui-color-danger': dangerTone.main,
    '--ui-color-danger-hover': dangerTone.hover,
    '--ui-color-danger-fg': dangerTone.fg,
    '--ui-color-danger-subtle': dangerTone.subtle,
    '--ui-color-success': successTone.main,
    '--ui-color-success-fg': successTone.fg,
    '--ui-color-success-subtle': successTone.subtle,
    '--ui-color-warning': warningTone.main,
    '--ui-color-warning-fg': warningTone.fg,
    '--ui-color-warning-subtle': warningTone.subtle,
    '--ui-color-info': infoTone.main,
    '--ui-color-info-fg': infoTone.fg,
    '--ui-color-info-subtle': infoTone.subtle,
    '--ui-color-focus': accentMain,
    '--ui-color-overlay': oklch(light ? stop.fg : 0.08, neutral, hue, light ? 0.4 : 0.62),
    '--ui-shadow-sm': shadow.sm,
    '--ui-shadow-md': shadow.md,
    '--ui-shadow-pop': shadow.pop,
    '--ui-scrollbar-track': 'transparent',
    '--ui-scrollbar-thumb': oklch(stop.borderStrong, neutral * 1.4, hue),
    '--ui-scrollbar-thumb-hover': oklch(stop.muted, neutral, hue),
  }
}

function shared(score: DesignScore): Record<string, string> {
  const shape = shapeStops[score.shape]
  const spaceFactor = score.density === 'tight' ? 0.75 : score.density === 'open' ? 1.35 : 1
  const typeFactor = score.density === 'tight' ? 0.92 : score.density === 'open' ? 1.06 : 1
  const spaces = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]
  const sizes = [0.75, 0.875, 1, 1.125, 1.5, 2.25]
  const heights =
    score.density === 'tight'
      ? [1.75, 2.15, 2.5]
      : score.density === 'open'
        ? [2.35, 2.85, 3.4]
        : [2, 2.5, 3]
  const motion =
    score.motion === 'still'
      ? { duration: '0ms', press: '0ms', reveal: '0ms', scale: '1', ease: 'linear' }
      : score.motion === 'measured'
        ? {
            duration: '280ms',
            press: '180ms',
            reveal: '420ms',
            scale: '0.99',
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }
        : {
            duration: '120ms',
            press: '90ms',
            reveal: '180ms',
            scale: '0.985',
            ease: 'cubic-bezier(0.2, 0, 0, 1)',
          }
  const line = score.density === 'tight' ? '1.35' : score.density === 'open' ? '1.65' : '1.5'
  const sans = score.voice === 'mono' ? monoStack : plainSans
  const display = score.voice === 'mono' ? monoStack : plainDisplay
  const spaceVars = Object.fromEntries(
    spaces.map((step, index) => [`--ui-space-${index + 1}`, rem(step * spaceFactor)]),
  )
  const sizeNames = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
  const sizeVars = Object.fromEntries(
    sizes.map((step, index) => [`--ui-font-size-${sizeNames[index]}`, rem(step * typeFactor)]),
  )
  return {
    '--ui-font-sans': sans,
    '--ui-font-display': display,
    '--ui-font-mono': monoStack,
    ...sizeVars,
    '--ui-line-height': line,
    ...spaceVars,
    '--ui-radius-sm': shape.sm,
    '--ui-radius-md': shape.md,
    '--ui-radius-lg': shape.lg,
    '--ui-radius-full': shape.full,
    '--ui-button-radius': shape.button,
    '--ui-control-radius': shape.control,
    '--ui-table-radius': shape.table,
    '--ui-control-height-sm': rem(heights[0] ?? 2),
    '--ui-control-height-md': rem(heights[1] ?? 2.5),
    '--ui-control-height-lg': rem(heights[2] ?? 3),
    '--ui-duration': motion.duration,
    '--ui-duration-press': motion.press,
    '--ui-duration-reveal': motion.reveal,
    '--ui-press-scale': motion.scale,
    '--ui-ease': motion.ease,
    '--ui-scrollbar-size':
      score.density === 'tight' ? '6px' : score.density === 'open' ? '10px' : '8px',
    '--ui-scrollbar-radius': shape.scroll,
  }
}

export function compileScore(score: DesignScore): CompiledScore {
  return {
    light: colors(score, 'light'),
    dark: colors(score, 'dark'),
    shared: shared(score),
  }
}

export function scoreVariables(score: DesignScore, scheme: ScoreScheme): Record<string, string> {
  const compiled = compileScore(score)
  return { ...compiled.shared, ...compiled[scheme] }
}
