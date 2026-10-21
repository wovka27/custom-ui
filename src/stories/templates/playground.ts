import { defineComponent, h, type ConcreteComponent, type VNodeChild } from 'vue'
import type { Args } from '@storybook/vue3-vite'

export interface PlaygroundInput {
  args?: Args
  parameters?: Args
  render?: (args: Args) => ConcreteComponent
}

interface StoryContextLike {
  component?: ConcreteComponent
}

function mount(component: ConcreteComponent, args: Args): ConcreteComponent {
  return defineComponent({
    name: 'PlaygroundStory',
    setup() {
      return () => {
        const props: Args = {}
        let slot: VNodeChild
        for (const [key, value] of Object.entries(args)) {
          if (key === 'default') slot = value as VNodeChild
          else props[key] = value
        }
        return h(component, props, slot === undefined ? undefined : { default: () => slot })
      }
    },
  })
}

export function playground(extra?: PlaygroundInput) {
  return {
    name: 'Playground' as const,
    ...(extra?.parameters ? { parameters: extra.parameters } : {}),
    ...(extra?.args ? { args: extra.args } : {}),
    render(args: Args = {}, context?: StoryContextLike) {
      if (extra?.render) return extra.render(args)
      const component = context?.component
      if (!component) throw new Error('Playground requires meta.component or a custom render.')
      return mount(component, args)
    },
  }
}
