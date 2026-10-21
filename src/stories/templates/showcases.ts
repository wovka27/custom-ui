import type { ConcreteComponent } from 'vue'

export interface ShowcaseParameters {
  layout?: 'padded' | 'centered' | 'fullscreen'
}

export function showcases(render: () => ConcreteComponent, parameters?: ShowcaseParameters) {
  return {
    name: 'Showcases',
    parameters: {
      controls: { disable: true },
      layout: parameters?.layout ?? 'padded',
    },
    render,
  }
}
