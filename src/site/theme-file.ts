import {
  tokenDefault,
  tokenOverrides,
  type TokenOverrideDocument,
  type TokenRecord,
  type TokenTreeNode,
} from '@/styles/token-override'

export const themeImport = `import '@wovka-dev/custom-ui/styles.css'
import './ui-theme.css'`

interface ThemeSection {
  readonly title: string
  readonly tokens: readonly TokenRecord[]
}

function plain(value: string): string {
  return value.replaceAll('*/', '* /').replace(/\s+/g, ' ').trim()
}

function sections(document: TokenOverrideDocument): readonly ThemeSection[] {
  const byName = new Map(document.tokens.map((token) => [token.name, token]))
  const found: ThemeSection[] = []

  function walk(node: TokenTreeNode, title: string): void {
    const tokens = node.tokens.map((name) => byName.get(name))
    const present = tokens.filter((token): token is TokenRecord => token !== undefined)
    if (present.length > 0) found.push({ title, tokens: present })
    for (const child of node.children) walk(child, `${title} / ${child.title}`)
  }

  for (const node of document.tree) walk(node, node.title)
  return found
}

function sharedHint(token: TokenRecord): string {
  if (token.fallbackByVariant !== null) return 'one value for every variant'
  const current = tokenDefault(token)
  return current === 'unset' ? '<value>' : current
}

function commentLine(token: TokenRecord, value: string): string {
  return `  /* ${token.name}: ${plain(value)}; ${plain(token.affects)} */`
}

function lightBlock(groups: readonly ThemeSection[]): string {
  const lines = [':root,', "[data-theme='light'] {"]
  for (const group of groups) {
    lines.push(`  /* ${group.title} */`)
    for (const token of group.tokens) {
      const value = token.themes === null ? sharedHint(token) : token.themes.light
      lines.push(commentLine(token, value))
    }
  }
  lines.push('}')
  return lines.join('\n')
}

function darkBlock(groups: readonly ThemeSection[], selector: string): string {
  const lines = [`${selector} {`]
  for (const group of groups) {
    const themed = group.tokens.flatMap((token) => (token.themes === null ? [] : [token]))
    if (themed.length === 0) continue
    lines.push(`  /* ${group.title} */`)
    for (const token of themed) {
      const dark = token.themes
      if (dark === null) continue
      lines.push(commentLine(token, dark.dark))
    }
  }
  lines.push('}')
  return lines.join('\n')
}

function contractLine(token: TokenRecord): string {
  const role = plain(token.affects)
  if (token.themes !== null) {
    return `${token.name} | light and dark | ${token.cssProperty} | ${role} | light ${plain(token.themes.light)} | dark ${plain(token.themes.dark)}`
  }
  const kind = token.fallbackByVariant === null ? 'shared' : 'shared, one value for every variant'
  return `${token.name} | ${kind} | ${token.cssProperty} | ${role} | ${plain(sharedHint(token))}`
}

function spaceRange(document: TokenOverrideDocument): string {
  const names = document.tokens
    .filter((token) => token.name.startsWith('--ui-space-'))
    .map((token) => token.name)
  const first = names[0]
  const last = names[names.length - 1]
  if (first === undefined || last === undefined) return 'the space variables in CONTRACT'
  return `${first} through ${last}`
}

export function themePrompt(document: TokenOverrideDocument): string {
  const groups = sections(document)
  const contract = groups
    .flatMap((group) => [`# ${group.title}`, ...group.tokens.map((token) => contractLine(token))])
    .join('\n')

  return `You write one CSS file that overrides the Custom UI kit from a Figma variable collection.

Paste the Figma color styles and the spacing scale under FIGMA. Include light and dark modes when Figma has them. Return only the CSS file.

Rules:
- Use only the variable names in CONTRACT. Do not invent or rename a variable.
- Omit a variable when Figma has no match. An omitted variable keeps the kit default.
- Put shared values in the :root, [data-theme='light'] block only. Shared values are type, space, radius, motion, layout, and component hooks.
- Put each theme color in three places: the light block, [data-theme='dark'], and the prefers-color-scheme dark block. The two dark blocks must list the same declarations.
- Map spacing from the smallest Figma step onto ${spaceRange(document)}, in that order. Extra Figma steps do not become new variables.
- Map colors by role: background, foreground, muted text, surface, border, accent, danger, success, warning, info, focus, overlay. Accent is the only chromatic emphasis. Status colors stay recognizable.
- A button hook set to one value restyles every button variant. Omit it to keep the variant differences.
- Do not set a variable on a component selector. This file is imported at the project root, after the kit stylesheet.
- Pagination radius is fixed. Do not add a variable for it.
- Values are CSS: oklch(), a hex color, rem, or px.

Return CSS in this shape, with only the variables you set:

:root,
[data-theme='light'] {
  --ui-color-bg: oklch(0.97 0.004 250);
  --ui-space-2: 0.5rem;
}

[data-theme='dark'] {
  --ui-color-bg: oklch(0.18 0.014 255);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --ui-color-bg: oklch(0.18 0.014 255);
  }
}

CONTRACT
${contract}

FIGMA
`
}

export function themeStylesheet(document: TokenOverrideDocument): string {
  const groups = sections(document)
  const dark = darkBlock(groups, "[data-theme='dark']")
  const system = darkBlock(groups, ":root:not([data-theme='light'])")
  return `/*
  Custom UI theme file.
  Save as ui-theme.css and import it after the kit stylesheet:

${themeImport}

  Uncomment a declaration to override that variable.
  A line left commented keeps the kit default.
  A theme color is listed three times: light, an explicit dark theme, and the system dark theme.
  The two dark copies must stay the same.
  Type, space, radius, motion, and component hooks are listed once.
  Do not add variable names. Pagination radius is not a variable.
*/

${lightBlock(groups)}

${dark}

@media (prefers-color-scheme: dark) {
${system
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
}
`
}

export const figmaPrompt = themePrompt(tokenOverrides)
export const figmaStylesheet = themeStylesheet(tokenOverrides)
