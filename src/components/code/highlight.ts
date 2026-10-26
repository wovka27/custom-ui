export type CodeLanguage = 'markup' | 'css' | 'shell' | 'json' | 'script'

export interface CodeToken {
  kind: 'tag' | 'attr' | 'string' | 'comment' | 'keyword' | 'number' | 'punct' | 'text'
  text: string
}

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'as',
  'const',
  'let',
  'var',
  'function',
  'return',
  'type',
  'interface',
  'if',
  'else',
  'new',
  'await',
  'async',
  'true',
  'false',
  'undefined',
  'null',
  'of',
  'in',
  'typeof',
  'void',
])

export function detectLanguage(source: string): CodeLanguage {
  const text = source.trimStart()
  if (text.startsWith('<')) return 'markup'
  if (/^(?:npm|pnpm|yarn|bun)\b/.test(text)) return 'shell'
  if (text.startsWith('{') || text.startsWith('[')) return 'json'
  if (/^(?:import|export|const|let|function|type|interface)\b/.test(text)) return 'script'
  if (
    text.startsWith('/*') ||
    text.startsWith('.') ||
    text.startsWith('#') ||
    text.startsWith('--') ||
    text.startsWith('@')
  ) {
    return 'css'
  }
  return 'markup'
}

export function tokenize(
  source: string,
  language: CodeLanguage = detectLanguage(source),
): CodeToken[] {
  if (language === 'markup') return markup(source)
  if (language === 'css') return css(source)
  if (language === 'shell') return shell(source)
  if (language === 'json') return json(source)
  return script(source)
}

function push(tokens: CodeToken[], kind: CodeToken['kind'], text: string): void {
  if (text === '') return
  const last = tokens[tokens.length - 1]
  if (last !== undefined && last.kind === kind) {
    last.text += text
    return
  }
  tokens.push({ kind, text })
}

function quoted(source: string, index: number): string {
  const quote = source[index]
  let end = index + 1
  while (end < source.length) {
    if (source[end] === '\\') {
      end += 2
      continue
    }
    if (source[end] === quote) return source.slice(index, end + 1)
    end += 1
  }
  return source.slice(index)
}

function markup(source: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0
  while (index < source.length) {
    if (source.startsWith('<!--', index)) {
      const end = source.indexOf('-->', index + 4)
      const stop = end === -1 ? source.length : end + 3
      push(tokens, 'comment', source.slice(index, stop))
      index = stop
      continue
    }
    if (source[index] !== '<') {
      const next = source.indexOf('<', index)
      const stop = next === -1 ? source.length : next
      push(tokens, 'text', source.slice(index, stop))
      index = stop
      continue
    }
    const tag = /^<\/?([A-Za-z][\w:-]*)/.exec(source.slice(index))
    if (tag === null) {
      push(tokens, 'text', '<')
      index += 1
      continue
    }
    push(tokens, 'punct', '<')
    index += 1
    if (source[index] === '/') {
      push(tokens, 'punct', '/')
      index += 1
    }
    const name = tag[1] ?? ''
    push(tokens, 'tag', name)
    index += name.length
    while (index < source.length && source[index] !== '>') {
      if (source[index] === '/' && source[index + 1] === '>') break
      if (/\s/.test(source[index] ?? '')) {
        const start = index
        while (index < source.length && /\s/.test(source[index] ?? '')) index += 1
        push(tokens, 'text', source.slice(start, index))
        continue
      }
      const attr = /^[^\s=/>]+/.exec(source.slice(index))
      if (attr === null) {
        push(tokens, 'text', source[index] ?? '')
        index += 1
        continue
      }
      push(tokens, 'attr', attr[0])
      index += attr[0].length
      if (source[index] !== '=') continue
      push(tokens, 'punct', '=')
      index += 1
      const quote = source[index]
      if (quote === '"' || quote === "'") {
        const value = quoted(source, index)
        push(tokens, 'string', value)
        index += value.length
        continue
      }
      const bare = /^[^\s>]+/.exec(source.slice(index))
      if (bare !== null) {
        push(tokens, 'string', bare[0])
        index += bare[0].length
      }
    }
    if (source[index] === '/') {
      push(tokens, 'punct', '/')
      index += 1
    }
    if (source[index] === '>') {
      push(tokens, 'punct', '>')
      index += 1
    }
  }
  return tokens
}

function readNumber(source: string, index: number): string {
  const match = /^(?:\d+\.?\d*|\.\d+)(?:px|rem|em|ms|s|%|dvh|vh|vw|fr)?/i.exec(source.slice(index))
  return match?.[0] ?? ''
}

function css(source: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0
  while (index < source.length) {
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2)
      const stop = end === -1 ? source.length : end + 2
      push(tokens, 'comment', source.slice(index, stop))
      index = stop
      continue
    }
    const char = source[index] ?? ''
    if (char === '"' || char === "'") {
      const value = quoted(source, index)
      push(tokens, 'string', value)
      index += value.length
      continue
    }
    if (char === '.' && /[A-Za-z_-]/.test(source[index + 1] ?? '')) {
      const selector = /^\.[A-Za-z_-][\w-]*/.exec(source.slice(index))
      if (selector !== null) {
        push(tokens, 'tag', selector[0])
        index += selector[0].length
        continue
      }
    }
    if (char === '#' && /[A-Za-z_-]/.test(source[index + 1] ?? '')) {
      const selector = /^#[A-Za-z_-][\w-]*/.exec(source.slice(index))
      if (selector !== null) {
        push(tokens, 'tag', selector[0])
        index += selector[0].length
        continue
      }
    }
    if (char === '-' && source[index + 1] === '-' && /[A-Za-z_]/.test(source[index + 2] ?? '')) {
      const custom = /^--[A-Za-z_][\w-]*/.exec(source.slice(index))
      if (custom !== null) {
        push(tokens, 'attr', custom[0])
        index += custom[0].length
        continue
      }
    }
    const number = readNumber(source, index)
    if (number !== '' && (index === 0 || !/[A-Za-z_\d-]/.test(source[index - 1] ?? ''))) {
      push(tokens, 'number', number)
      index += number.length
      continue
    }
    if (/[A-Za-z_]/.test(char)) {
      const ident = /^[A-Za-z_][\w-]*/.exec(source.slice(index))
      const name = ident?.[0] ?? char
      let look = index + name.length
      while (look < source.length && /\s/.test(source[look] ?? '')) look += 1
      push(tokens, source[look] === ':' ? 'keyword' : 'text', name)
      index += name.length
      continue
    }
    if ('{}[]();:,>+~*'.includes(char)) {
      push(tokens, 'punct', char)
      index += 1
      continue
    }
    push(tokens, 'text', char)
    index += 1
  }
  return tokens
}

function shell(source: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0
  let command = true
  while (index < source.length) {
    const char = source[index] ?? ''
    if (char === '\n') {
      push(tokens, 'text', char)
      index += 1
      command = true
      continue
    }
    if (/\s/.test(char)) {
      push(tokens, 'text', char)
      index += 1
      continue
    }
    if (char === '#' && (index === 0 || /\s/.test(source[index - 1] ?? ''))) {
      const end = source.indexOf('\n', index)
      const stop = end === -1 ? source.length : end
      push(tokens, 'comment', source.slice(index, stop))
      index = stop
      command = false
      continue
    }
    if (char === '"' || char === "'") {
      const value = quoted(source, index)
      push(tokens, 'string', value)
      index += value.length
      command = false
      continue
    }
    const word = /^\S+/.exec(source.slice(index))
    const text = word?.[0] ?? char
    const kind = text.startsWith('-') ? 'attr' : command ? 'keyword' : 'text'
    push(tokens, kind, text)
    index += text.length
    command = false
  }
  return tokens
}

function json(source: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0
  while (index < source.length) {
    const char = source[index] ?? ''
    if (char === '"' || char === "'") {
      const value = quoted(source, index)
      let look = index + value.length
      while (look < source.length && /\s/.test(source[look] ?? '')) look += 1
      push(tokens, source[look] === ':' ? 'attr' : 'string', value)
      index += value.length
      continue
    }
    const number = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(source.slice(index))
    if (number !== null && (index === 0 || !/[A-Za-z_\d]/.test(source[index - 1] ?? ''))) {
      push(tokens, 'number', number[0])
      index += number[0].length
      continue
    }
    if (/[A-Za-z_]/.test(char)) {
      const ident = /^[A-Za-z_][\w$]*/.exec(source.slice(index))
      const name = ident?.[0] ?? char
      push(
        tokens,
        name === 'true' || name === 'false' || name === 'null' ? 'keyword' : 'text',
        name,
      )
      index += name.length
      continue
    }
    if ('{}[](),:'.includes(char)) {
      push(tokens, 'punct', char)
      index += 1
      continue
    }
    push(tokens, 'text', char)
    index += 1
  }
  return tokens
}

function script(source: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0
  while (index < source.length) {
    if (source.startsWith('//', index)) {
      const end = source.indexOf('\n', index)
      const stop = end === -1 ? source.length : end
      push(tokens, 'comment', source.slice(index, stop))
      index = stop
      continue
    }
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2)
      const stop = end === -1 ? source.length : end + 2
      push(tokens, 'comment', source.slice(index, stop))
      index = stop
      continue
    }
    const char = source[index] ?? ''
    if (char === '"' || char === "'" || char === '`') {
      const value = quoted(source, index)
      push(tokens, 'string', value)
      index += value.length
      continue
    }
    const number = readNumber(source, index)
    if (number !== '' && (index === 0 || !/[A-Za-z_\d$]/.test(source[index - 1] ?? ''))) {
      push(tokens, 'number', number)
      index += number.length
      continue
    }
    if (/[A-Za-z_$]/.test(char)) {
      const ident = /^[A-Za-z_$][\w$]*/.exec(source.slice(index))
      const name = ident?.[0] ?? char
      push(tokens, KEYWORDS.has(name) ? 'keyword' : 'text', name)
      index += name.length
      continue
    }
    if ('{}[]().,;:+-*/=<>|&!?'.includes(char)) {
      push(tokens, 'punct', char)
      index += 1
      continue
    }
    push(tokens, 'text', char)
    index += 1
  }
  return tokens
}
