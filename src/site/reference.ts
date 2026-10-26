import { componentReference } from './reference.generated'

export interface ApiRow {
  name: string
  description: string
  type: string
  default: string
  required: boolean
}

export interface ComponentExample {
  title: string
  note: string
  template: string
  live: boolean
  render: string
}

export interface CssVariable {
  name: string
  property: string
  value: string
  affects: string
  hook: boolean
}

export interface ComponentReference {
  props: ApiRow[]
  events: ApiRow[]
  slots: ApiRow[]
  exposed: ApiRow[]
  examples: ComponentExample[]
  variables: CssVariable[]
  css: string
}

export function referenceFor(name: string): ComponentReference | undefined {
  return componentReference[name]
}
