import { effectScope } from 'vue'
import { describe, expect, it } from 'vitest'
import { useControllable } from './use-controllable'

describe('useControllable', () => {
  it('keeps an uncontrolled value inside the composable', () => {
    const scope = effectScope()
    const api = scope.run(() =>
      useControllable({
        value: undefined,
        defaultValue: 'draft',
      }),
    )
    if (!api) throw new Error('scope did not start')
    expect(api.value.value).toBe('draft')
    api.setValue('saved')
    expect(api.value.value).toBe('saved')
    scope.stop()
  })

  it('reports the controlled value and still notifies the owner', () => {
    const scope = effectScope()
    const seen: string[] = []
    const api = scope.run(() =>
      useControllable({
        value: 'owned',
        defaultValue: 'draft',
        onChange: (next) => {
          seen.push(next)
        },
      }),
    )
    if (!api) throw new Error('scope did not start')
    api.setValue('next')
    expect(api.value.value).toBe('owned')
    expect(seen).toEqual(['next'])
    scope.stop()
  })
})
