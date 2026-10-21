import raw from './token-overrides.json'

export interface TokenThemes {
  readonly light: string
  readonly dark: string
}

export interface TokenRecord {
  readonly name: `--ui-${string}`
  readonly path: readonly string[]
  readonly component: string
  readonly variant: string
  readonly state: string
  readonly cssProperty: string
  readonly declared: boolean
  readonly value: string | null
  readonly themes: TokenThemes | null
  readonly fallback: string | null
  readonly fallbackByVariant: Readonly<Record<string, string>> | null
  readonly reads: readonly `--ui-${string}`[]
  readonly affects: string
  readonly proposal: null
}

export interface TokenTreeNode {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly fixed: readonly string[]
  readonly tokens: readonly `--ui-${string}`[]
  readonly children: readonly TokenTreeNode[]
}

export interface TokenOverrideExample {
  readonly proposal: Readonly<Record<string, string | TokenThemes>>
  readonly css: string
}

export interface TokenOverrideDocument {
  readonly kit: string
  readonly version: number
  readonly prompt: string
  readonly rules: readonly string[]
  readonly example: TokenOverrideExample
  readonly tree: readonly TokenTreeNode[]
  readonly tokens: readonly TokenRecord[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Token override field "${key}" must be a non-empty string.`)
  }
  return value
}

function readNullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new Error(`Token override field "${key}" must be a string or null.`)
  }
  return value
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key]
  if (typeof value !== 'boolean') {
    throw new Error(`Token override field "${key}" must be a boolean.`)
  }
  return value
}

function readTokenName(value: unknown): `--ui-${string}` {
  if (typeof value !== 'string' || !value.startsWith('--ui-')) {
    throw new Error('A token name must start with --ui-.')
  }
  const suffix = value.slice('--ui-'.length)
  if (suffix.length === 0) throw new Error('A token name is missing its suffix.')
  return `--ui-${suffix}`
}

function readStringList(value: unknown, key: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0)) {
    throw new Error(`Token override field "${key}" must be an array of strings.`)
  }
  return value
}

function readNameList(value: unknown, key: string): readonly `--ui-${string}`[] {
  return readStringList(value, key).map((item) => readTokenName(item))
}

function readThemes(value: unknown): TokenThemes | null {
  if (value === null) return null
  if (!isRecord(value)) throw new Error('Token themes must be an object or null.')
  return { light: readString(value, 'light'), dark: readString(value, 'dark') }
}

function readVariantMap(value: unknown): Readonly<Record<string, string>> | null {
  if (value === null) return null
  if (!isRecord(value)) throw new Error('fallbackByVariant must be an object or null.')
  const map: Record<string, string> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'string' || item.length === 0) {
      throw new Error(`fallbackByVariant.${key} must be a non-empty string.`)
    }
    map[key] = item
  }
  return map
}

function readProposalValue(value: unknown): string | TokenThemes {
  if (typeof value === 'string' && value.length > 0) return value
  const themes = readThemes(value)
  if (themes === null) throw new Error('An example proposal must be a CSS value or a light/dark pair.')
  return themes
}

function readToken(value: unknown): TokenRecord {
  if (!isRecord(value)) throw new Error('A token entry must be an object.')
  if (value.proposal !== null) {
    throw new Error(`${readTokenName(value.name)} must keep proposal null in the kit contract.`)
  }
  return {
    name: readTokenName(value.name),
    path: readStringList(value.path, 'path'),
    component: readString(value, 'component'),
    variant: readString(value, 'variant'),
    state: readString(value, 'state'),
    cssProperty: readString(value, 'cssProperty'),
    declared: readBoolean(value, 'declared'),
    value: readNullableString(value, 'value'),
    themes: readThemes(value.themes),
    fallback: readNullableString(value, 'fallback'),
    fallbackByVariant: readVariantMap(value.fallbackByVariant),
    reads: readNameList(value.reads, 'reads'),
    affects: readString(value, 'affects'),
    proposal: null,
  }
}

function readTreeNode(value: unknown): TokenTreeNode {
  if (!isRecord(value)) throw new Error('A tree node must be an object.')
  const children = value.children === undefined ? [] : value.children
  const tokens = value.tokens === undefined ? [] : value.tokens
  const fixed = value.fixed === undefined ? [] : value.fixed
  if (!Array.isArray(children)) throw new Error('Tree children must be an array.')
  return {
    id: readString(value, 'id'),
    title: readString(value, 'title'),
    summary: readString(value, 'summary'),
    fixed: readStringList(fixed, 'fixed'),
    tokens: readNameList(tokens, 'tokens'),
    children: children.map((child) => readTreeNode(child)),
  }
}

function readExample(value: unknown): TokenOverrideExample {
  if (!isRecord(value) || !isRecord(value.proposal)) {
    throw new Error('The override example must include a proposal object.')
  }
  const proposal: Record<string, string | TokenThemes> = {}
  for (const [key, item] of Object.entries(value.proposal)) {
    proposal[readTokenName(key)] = readProposalValue(item)
  }
  return { proposal, css: readString(value, 'css') }
}

function readDocument(value: unknown): TokenOverrideDocument {
  if (!isRecord(value) || !Array.isArray(value.tokens) || !Array.isArray(value.tree)) {
    throw new Error('token-overrides.json is not a token document.')
  }
  if (!Array.isArray(value.rules)) throw new Error('token-overrides.json is missing rules.')
  return {
    kit: readString(value, 'kit'),
    version: typeof value.version === 'number' ? value.version : Number.NaN,
    prompt: readString(value, 'prompt'),
    rules: readStringList(value.rules, 'rules'),
    example: readExample(value.example),
    tree: value.tree.map((node) => readTreeNode(node)),
    tokens: value.tokens.map((entry) => readToken(entry)),
  }
}

export const tokenOverrides: TokenOverrideDocument = readDocument(raw)

if (!Number.isFinite(tokenOverrides.version)) {
  throw new Error('token-overrides.json version must be a number.')
}

export const tokenOverrideJson = `${JSON.stringify(tokenOverrides, null, 2)}\n`

export function tokenDefault(token: TokenRecord): string {
  if (token.value !== null) return token.value
  if (token.themes !== null) return `light ${token.themes.light} / dark ${token.themes.dark}`
  if (token.fallback !== null) return token.fallback
  if (token.fallbackByVariant !== null) {
    return Object.entries(token.fallbackByVariant)
      .map(([variant, value]) => `${variant}: ${value}`)
      .join(' · ')
  }
  return 'unset'
}
