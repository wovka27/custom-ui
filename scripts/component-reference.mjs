import { createRequire } from 'node:module'
import { existsSync, globSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { createChecker } = require('vue-component-meta')
const { compile } = require('@vue/compiler-dom')

const TYPE_LIMIT = 360
const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias

function catalogNames() {
  const source = readFileSync('src/site/catalog.ts', 'utf8')
  return [...new Set([...source.matchAll(/'(Ui[A-Z][A-Za-z0-9]*)'/g)].map((match) => match[1]))]
}

function findVue(name, files) {
  const matches = files.filter((file) => file.replace(/\\/g, '/').endsWith(`/${name}.vue`))
  if (matches.length !== 1) {
    throw new Error(`Expected one Vue file for ${name}, found ${matches.length}`)
  }
  return matches[0].replace(/\\/g, '/')
}

function kebabTags(source) {
  return source.replace(/<\/?([A-Z][A-Za-z0-9]*)\b/g, (match, name) => {
    const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    return match.replace(name, kebab)
  })
}

function dedent(source) {
  const lines = source.replace(/^\n/, '').replace(/\s+$/, '').split('\n')
  const indents = lines
    .filter((line) => line.trim() !== '')
    .map((line) => /^ */.exec(line)?.[0].length ?? 0)
  const min = indents.length === 0 ? 0 : Math.min(...indents)
  return lines
    .map((line) => line.slice(min))
    .join('\n')
    .trim()
}

function readAttr(raw, name) {
  const double = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`).exec(raw)
  if (double?.[1] !== undefined) return double[1]
  const single = new RegExp(`\\b${name}\\s*=\\s*'([^']*)'`).exec(raw)
  return single?.[1] ?? ''
}

function casesFrom(source) {
  const cases = []
  let index = 0
  while (index < source.length) {
    const start = source.indexOf('<showcase-case', index)
    if (start === -1) break
    let cursor = start + '<showcase-case'.length
    let quote = ''
    for (; cursor < source.length; cursor += 1) {
      const char = source[cursor]
      if (quote !== '') {
        if (char === quote) quote = ''
        continue
      }
      if (char === '"' || char === "'") {
        quote = char
        continue
      }
      if (char === '>') break
    }
    const attrs = source.slice(start + '<showcase-case'.length, cursor)
    const close = source.indexOf('</showcase-case>', cursor)
    if (close === -1) break
    const title = readAttr(attrs, 'title')
    const template = dedent(kebabTags(source.slice(cursor + 1, close)))
    if (title !== '' && template !== '') {
      cases.push({ title, note: readAttr(attrs, 'note'), template })
    }
    index = close + '</showcase-case>'.length
  }
  return cases
}

function slotBindings(template) {
  const names = new Set()
  const pattern = /(?:v-slot:[\w-]+|#[\w-]+)\s*=\s*"\{([^}]*)\}"/g
  for (const match of template.matchAll(pattern)) {
    for (const part of (match[1] ?? '').split(',')) {
      const name = part.trim().split(':')[0]?.trim() ?? ''
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
    }
  }
  return names
}

function isClosed(expression, known) {
  const expr = expression.trim()
  if (expr === '' || expr.length > 800) return false
  const names = [...known]
  try {
    const probe = new Function(...names, `"use strict"; return (${expr});`)
    probe(...names.map(() => () => undefined))
    return true
  } catch (error) {
    return !(error instanceof ReferenceError) && !(error instanceof SyntaxError)
  }
}

function isLive(template) {
  if (/\bv-model[\w:.-]*/.test(template)) return false
  if (/(?:^|\s)v-bind\s*=/.test(template) || /(?:^|\s)v-on\s*=/.test(template)) return false
  const known = slotBindings(template)
  for (const match of template.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
    if (!isClosed(match[1] ?? '', known)) return false
  }
  for (const match of template.matchAll(/\bv-for\s*=\s*"([^"]*)"/g)) {
    const parts = /^\s*(?:\(\s*[^)]+?\s*\)|[A-Za-z_$][\w$]*)\s+in\s+([\s\S]+)$/.exec(match[1] ?? '')
    if (parts === null || !isClosed(parts[1] ?? '', known)) return false
  }
  for (const match of template.matchAll(/\bv-(?:if|else-if|show|html)\s*=\s*"([^"]*)"/g)) {
    if (!isClosed(match[1] ?? '', known)) return false
  }
  for (const match of template.matchAll(/(?:^|\s)(?::|@|v-bind:|v-on:)[\w:.-]+\s*=\s*"([^"]*)"/g)) {
    if (!isClosed(match[1] ?? '', known)) return false
  }
  return true
}

function renderOf(template) {
  try {
    const result = compile(template, { mode: 'function' })
    if (Array.isArray(result.errors) && result.errors.length > 0) return ''
    return typeof result.code === 'string' ? result.code : ''
  } catch {
    return ''
  }
}

function truncate(value) {
  const compact = value.replace(/\s+/g, ' ').trim()
  if (compact.length <= TYPE_LIMIT) return compact
  return `${compact.slice(0, TYPE_LIMIT - 1)}…`
}

function readableType(type, checker) {
  const parts = (type.isUnion() ? type.types : [type]).filter(
    (part) => (part.flags & ts.TypeFlags.Undefined) === 0,
  )
  const literals = parts.filter((part) => (part.flags & ts.TypeFlags.BooleanLiteral) !== 0)
  const rest = parts.filter((part) => (part.flags & ts.TypeFlags.BooleanLiteral) === 0)
  if (literals.length === 2 && rest.length === 0) return 'boolean'
  if (literals.length === 2 && rest.length === 1 && (rest[0].flags & ts.TypeFlags.Null) !== 0) {
    return 'boolean | null'
  }
  const names = parts.map((part) =>
    checker.typeToString(part, undefined, flags).replace(/\s+/g, ' '),
  )
  return truncate(names.join(' | '))
}

function plainDefault(value) {
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
  return value
}

function isLiteralUnion(type) {
  if (type === '' || type.length > 240) return false
  const parts = type.split(' | ')
  if (parts.length < 2) return false
  return parts.every(
    (part) =>
      /^"(?:[^"\\]|\\.)*"$/.test(part) ||
      /^-?\d+(?:\.\d+)?$/.test(part) ||
      part === 'true' ||
      part === 'false' ||
      part === 'null',
  )
}

function describeProp(documented, required, type, fallback) {
  if (documented !== '') return documented
  const lead = required ? 'Required' : 'Optional'
  if (type === 'boolean') {
    if (required) return 'Required boolean.'
    return fallback === 'true' ? 'Optional. On by default.' : 'Optional. Off by default.'
  }
  if (isLiteralUnion(type)) {
    const values = type
      .split(' | ')
      .map((part) => part.replace(/^"|"$/g, ''))
      .join(', ')
    const tail = fallback === '' ? '' : ` Default ${fallback}.`
    return `${lead}. One of ${values}.${tail}`
  }
  if (type === 'string' || type === 'number') {
    const word = type === 'string' ? 'text' : 'a number'
    const tail = fallback === '' ? '' : ` Default ${fallback}.`
    return `${lead} ${word}.${tail}`
  }
  if (type.length > 160) {
    if (type.startsWith('{'))
      return fallback === '' ? `${lead} object.` : `${lead} object. Default ${fallback}.`
    if (type.includes('=>')) {
      return fallback === '' ? `${lead} function.` : `${lead} function. Default ${fallback}.`
    }
    return fallback === '' ? `${lead}.` : `${lead}. Default ${fallback}.`
  }
  const tail = fallback === '' ? '' : ` Default ${fallback}.`
  return `${lead}. ${type}.${tail}`
}

function formatSignature(type) {
  const compact = truncate(type)
  if (compact.startsWith('[') && compact.endsWith(']')) return `(${compact.slice(1, -1)})`
  return compact
}

function payloadOf(signature) {
  const inner =
    signature.startsWith('(') && signature.endsWith(')') ? signature.slice(1, -1) : signature
  if (inner === '') return ''
  return inner
    .split(',')
    .map((part) => {
      const colon = part.indexOf(':')
      return (colon === -1 ? part : part.slice(colon + 1)).trim()
    })
    .join(', ')
}

function describeEvent(name, signature, documented) {
  if (documented !== '') return documented
  const payload = payloadOf(signature)
  if (name.startsWith('update:'))
    return `Emitted when ${name.slice(7)} changes. Payload ${payload}.`
  return payload === '' ? 'Emitted by the component.' : `Emitted with ${payload}.`
}

function slotType(type) {
  const compact = truncate(type)
  if (compact === '' || compact === 'any' || compact === 'unknown' || compact === '{}') return ''
  return compact
}

function describeSlot(name, type, documented) {
  if (documented !== '') return documented
  if (type === '') return name === 'default' ? 'The default slot.' : `The ${name} slot.`
  return name === 'default'
    ? `The default slot. Scope ${type}.`
    : `The ${name} slot. Scope ${type}.`
}

function row(name, description, type, fallback = '', required = false) {
  return { name, description, type, default: fallback, required }
}

function memberRows(items, describe, typeOf) {
  return items
    .filter((item) => item.name !== '')
    .map((item) => {
      const type = typeOf(item)
      const documented = typeof item.description === 'string' ? item.description.trim() : ''
      return row(item.name, describe(item.name, type, documented), type)
    })
}

function parseMixins(source) {
  const mixins = new Map()
  const pattern = /@mixin\s+([A-Za-z0-9_-]+)/g
  for (const match of source.matchAll(pattern)) {
    const name = match[1]
    if (name === undefined) continue
    const open = source.indexOf('{', match.index)
    if (open === -1) continue
    let depth = 0
    let end = open
    for (; end < source.length; end += 1) {
      const char = source[end]
      if (char === '{') depth += 1
      else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          end += 1
          break
        }
      }
    }
    mixins.set(name, source.slice(open, end))
  }
  return mixins
}

function readNames(source, mixins, seen, found) {
  for (const match of source.matchAll(/var\(\s*(--ui-[a-z0-9-]+)/g)) {
    const name = match[1]
    if (name !== undefined && !found.includes(name)) found.push(name)
  }
  for (const match of source.matchAll(/@include\s+([A-Za-z0-9_-]+)/g)) {
    const mixin = match[1]
    if (mixin === undefined || seen.has(mixin)) continue
    seen.add(mixin)
    const body = mixins.get(mixin)
    if (body !== undefined) readNames(body, mixins, seen, found)
  }
}

function styleSource(vueFile, catalog) {
  const directory = path.dirname(vueFile)
  const own = path.basename(vueFile)
  const parts = []
  for (const file of readdirSync(directory)) {
    if (!file.endsWith('.vue') && !file.endsWith('.scss')) continue
    const base = file.replace(/\.(vue|scss)$/, '')
    if (file !== own && base.startsWith('Ui') && catalog.has(base)) continue
    parts.push(readFileSync(path.join(directory, file), 'utf8'))
  }
  return parts.join('\n')
}

function tokenValue(token) {
  if (typeof token.value === 'string') return token.value
  if (token.themes !== null && typeof token.themes === 'object') {
    return `light ${token.themes.light} / dark ${token.themes.dark}`
  }
  if (typeof token.fallback === 'string') return token.fallback
  if (token.fallbackByVariant !== null && typeof token.fallbackByVariant === 'object') {
    return Object.entries(token.fallbackByVariant)
      .map(([variant, value]) => `${variant}: ${value}`)
      .join(' · ')
  }
  return 'unset'
}

function singleCssValue(token) {
  if (typeof token.value === 'string') return token.value
  if (typeof token.fallback === 'string') return token.fallback
  return ''
}

function cssBlock(variables) {
  const lines = variables
    .filter((variable) => variable.hook && variable.cssValue !== '')
    .map((variable) => `  ${variable.name}: ${variable.cssValue};`)
  if (lines.length === 0) return ''
  return `.ui-config {\n${lines.join('\n')}\n}`
}

const tokenDocument = JSON.parse(readFileSync('src/styles/token-overrides.json', 'utf8'))
const tokensByName = new Map(tokenDocument.tokens.map((token) => [token.name, token]))
const mixins = parseMixins(readFileSync('src/styles/_mixins.scss', 'utf8'))
const files = globSync('src/components/**/*.vue')
const catalog = new Set(catalogNames())
const unknownTokens = new Set()
const checker = createChecker('tsconfig.docgen.json')
const program = checker.getProgram().getTypeChecker()
const reference = {}
let liveCount = 0
let sourceCount = 0

for (const name of catalog) {
  const vueFile = findVue(name, files)
  const meta = checker.getComponentMeta(vueFile)
  const props = meta.props
    .filter((prop) => prop.global !== true && prop.name !== '')
    .map((prop) => {
      const type = readableType(prop.getTypeObject(), program)
      const fallback = typeof prop.default === 'string' ? truncate(prop.default) : ''
      const documented = typeof prop.description === 'string' ? prop.description.trim() : ''
      return row(
        prop.name,
        describeProp(documented, prop.required === true, type, plainDefault(fallback)),
        type,
        fallback,
        prop.required === true,
      )
    })
  const events = memberRows(
    meta.events,
    (eventName, type, documented) => describeEvent(eventName, type, documented),
    (event) => formatSignature(event.type ?? ''),
  )
  const slots = memberRows(
    meta.slots,
    (slotName, type, documented) => describeSlot(slotName, type, documented),
    (slot) => slotType(slot.type ?? ''),
  )
  const exposed = memberRows(
    meta.exposed,
    (exposeName, type, documented) =>
      documented !== ''
        ? documented
        : type === ''
          ? `Exposed ${exposeName}.`
          : `Exposed ${exposeName}. ${type}.`,
    (expose) => slotType(expose.type ?? ''),
  )
  const storyPath = vueFile.replace(/\.vue$/, '.stories.ts')
  const story = existsSync(storyPath) ? readFileSync(storyPath, 'utf8') : ''
  const examples = casesFrom(story).map((example) => {
    const render = isLive(example.template) ? renderOf(example.template) : ''
    const live = render !== ''
    if (live) liveCount += 1
    else sourceCount += 1
    return { ...example, live, render: live ? render : '' }
  })
  const read = []
  readNames(styleSource(vueFile, catalog), mixins, new Set(), read)
  const variables = read
    .filter((tokenName) => {
      if (tokensByName.has(tokenName)) return true
      unknownTokens.add(tokenName)
      return false
    })
    .map((tokenName) => {
      const token = tokensByName.get(tokenName)
      const cssValue = singleCssValue(token)
      return {
        name: tokenName,
        property: typeof token.cssProperty === 'string' ? token.cssProperty : '',
        value: tokenValue(token),
        affects: typeof token.affects === 'string' ? token.affects : '',
        hook: token.component === name,
        cssValue,
      }
    })
    .sort((left, right) => Number(right.hook) - Number(left.hook))
  reference[name] = {
    props,
    events,
    slots,
    exposed,
    examples,
    variables: variables.map((variable) => ({
      name: variable.name,
      property: variable.property,
      value: variable.value,
      affects: variable.affects,
      hook: variable.hook,
    })),
    css: cssBlock(variables),
  }
}

const names = Object.keys(reference).sort()
const ordered = {}
for (const name of names) ordered[name] = reference[name]

const output = `// Generated by scripts/component-reference.mjs. Do not edit by hand.
import type { ComponentReference } from './reference'

export const componentReference: Record<string, ComponentReference> = ${JSON.stringify(ordered, null, 2)}
`
writeFileSync('src/site/reference.generated.ts', output, 'utf8')
console.warn(
  `reference: ${names.length} components, ${liveCount} live examples, ${sourceCount} source examples`,
)
if (unknownTokens.size > 0) {
  console.warn(`Unlisted tokens: ${[...unknownTokens].sort().join(', ')}`)
}
