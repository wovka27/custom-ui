import { describe, expect, it } from 'vitest'
import { componentNeighbors, guideNeighbors } from './nav'

describe('site neighbors', () => {
  it('walks the guide in order', () => {
    expect(guideNeighbors('installation').previous).toBeUndefined()
    expect(guideNeighbors('installation').next).toEqual({
      href: '#/guide/quick-start',
      label: 'Quick start',
    })
    expect(guideNeighbors('tokens').next).toBeUndefined()
    expect(guideNeighbors('tokens').previous?.href).toBe('#/guide/theming')
  })

  it('walks components in catalog order', () => {
    const button = componentNeighbors('UiButton')
    expect(button.previous?.label).toBe('Autocomplete')
    expect(button.next?.label).toBe('Checkbox')
    expect(componentNeighbors('missing').next).toBeUndefined()
  })
})
