import { describe, expect, it } from 'vitest'
import { catalog } from './catalog'
import { componentReference } from './reference.generated'

const names = catalog.flatMap((group) => group.names)

function entry(name: string) {
  const found = componentReference[name]
  expect(found, name).toBeDefined()
  if (found === undefined) throw new Error(name)
  return found
}

describe('component reference', () => {
  it('covers every catalog component once', () => {
    expect(Object.keys(componentReference).sort()).toEqual([...names].sort())
  })

  it('reads the button contract and its real showcases', () => {
    const button = entry('UiButton')
    const variant = button.props.find((prop) => prop.name === 'variant')
    expect(variant?.type).toContain('"primary"')
    expect(variant?.description.toLowerCase()).toContain('primary')
    expect(variant?.default).toBe('"primary"')
    expect(button.events.some((event) => event.name === 'click')).toBe(true)
    expect(button.slots.map((slot) => slot.name).sort()).toEqual(['default', 'leading', 'trailing'])
    const variants = button.examples.find((example) => example.title === 'Variants')
    expect(variants?.live).toBe(true)
    expect(variants?.template).toContain('</ui-button>')
    expect(variants?.template).not.toContain('UiButton')
    expect(variants?.render).toContain('function render')
    const radius = button.variables.find((variable) => variable.name === '--ui-button-radius')
    expect(radius?.hook).toBe(true)
    expect(radius?.value).toBe('0.75rem')
    expect(button.variables.some((variable) => variable.name === '--ui-color-accent')).toBe(true)
    expect(button.css).toContain('--ui-button-radius: 0.75rem')
    expect(button.css.startsWith('.ui-config {')).toBe(true)
  })

  it('mounts static showcases and leaves stateful ones as source', () => {
    const checkbox = entry('UiCheckbox').examples.find((example) => example.title === 'States')
    expect(checkbox?.live).toBe(true)
    expect(checkbox?.template).toContain('indeterminate')
    const waiting = entry('UiUpload').examples.find(
      (example) => example.title === 'Waiting on the request',
    )
    expect(waiting?.live).toBe(false)
    expect(waiting?.render).toBe('')
    const gallery = entry('UiUpload').examples.find((example) => example.title === 'Gallery')
    expect(gallery?.live).toBe(true)
    const confirm = entry('UiDialog').examples.find((example) => example.title === 'Confirm')
    expect(confirm?.live).toBe(false)
    expect(confirm?.template).toContain('ui-dialog')
    expect(
      entry('UiDialog').variables.some((variable) => variable.name === '--ui-color-border'),
    ).toBe(true)
  })

  it('keeps every example in kebab case', () => {
    for (const name of names) {
      const info = entry(name)
      for (const example of info.examples) {
        expect(example.template.trim().length).toBeGreaterThan(0)
        expect(example.template).not.toMatch(/<\/?[A-Z]/)
        if (example.live) expect(example.render).toContain('function render')
        else expect(example.render).toBe('')
      }
      for (const variable of info.variables) {
        expect(variable.name.startsWith('--ui-')).toBe(true)
        expect(variable.affects.length).toBeGreaterThan(0)
      }
      if (info.css !== '') expect(info.css.startsWith('.ui-config {')).toBe(true)
    }
  })
})
