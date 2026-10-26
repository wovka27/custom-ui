import { describe, expect, it } from 'vitest'
import { parseHash, sectionOf } from './route'

describe('site route', () => {
  it('reads the home, the guide, a component, and a group', () => {
    expect(parseHash('')).toEqual({ kind: 'home' })
    expect(parseHash('#/')).toEqual({ kind: 'home' })
    expect(parseHash('#/guide/theming')).toEqual({ kind: 'guide', page: 'theming' })
    expect(parseHash('#/guide')).toEqual({ kind: 'guide', page: 'installation' })
    expect(parseHash('#/component/button')).toEqual({ kind: 'component', slug: 'button' })
    expect(parseHash('#/component/forms')).toEqual({ kind: 'components', group: 'forms' })
    expect(parseHash('#forms')).toEqual({ kind: 'components', group: 'forms' })
    expect(parseHash('#/resource')).toEqual({ kind: 'resource' })
    expect(sectionOf(parseHash('#/component/button'))).toBe('component')
  })
})
