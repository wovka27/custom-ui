import { describe, expect, it } from 'vitest'
import { detectLanguage, tokenize } from './highlight'

function painted(source: string): string {
  return tokenize(source)
    .map((part) => part.text)
    .join('')
}

describe('highlight', () => {
  it('keeps every character of a template', () => {
    const source = '<ui-button variant="danger">Save</ui-button>'
    expect(painted(source)).toBe(source)
    expect(tokenize(source).find((part) => part.kind === 'tag')?.text).toBe('ui-button')
    expect(tokenize(source).some((part) => part.kind === 'attr' && part.text === 'variant')).toBe(
      true,
    )
    expect(
      tokenize(source).some((part) => part.kind === 'string' && part.text === '"danger"'),
    ).toBe(true)
  })

  it('keeps comments, css, shell, json, and script intact', () => {
    const samples = [
      '<!-- note -->\n<span>Hi</span>',
      '.ui-config {\n  --ui-button-radius: 2px;\n}',
      'npm i @wovka-dev/custom-ui',
      '{\n  "hue": 42\n}',
      "import { UiButton } from 'custom-ui'",
    ]
    for (const sample of samples) expect(painted(sample)).toBe(sample)
  })

  it('uses the usual token roles', () => {
    expect(detectLanguage('npm i @wovka-dev/custom-ui')).toBe('shell')
    expect(tokenize('npm i @wovka-dev/custom-ui')[0]?.kind).toBe('keyword')
    expect(detectLanguage('.ui-config { color: red; }')).toBe('css')
    const css = tokenize('.ui-config {\n  --ui-button-radius: 2px;\n}')
    expect(css.some((part) => part.kind === 'tag' && part.text === '.ui-config')).toBe(true)
    expect(css.some((part) => part.kind === 'attr' && part.text === '--ui-button-radius')).toBe(
      true,
    )
    expect(css.some((part) => part.kind === 'number' && part.text === '2px')).toBe(true)
    const json = tokenize('{\n  "hue": 42\n}')
    expect(json.some((part) => part.kind === 'attr' && part.text === '"hue"')).toBe(true)
    expect(json.some((part) => part.kind === 'number' && part.text === '42')).toBe(true)
    const code = tokenize("import { UiButton } from 'custom-ui'")
    expect(code.some((part) => part.kind === 'keyword' && part.text === 'import')).toBe(true)
    expect(code.some((part) => part.kind === 'string' && part.text === "'custom-ui'")).toBe(true)
    expect(tokenize('<!-- note -->')[0]?.kind).toBe('comment')
  })
})
