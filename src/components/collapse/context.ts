import type { InjectionKey } from 'vue'

export interface CollapseContext {
  isOpen: (name: string) => boolean
  toggle: (name: string) => void
}

export const collapseKey: InjectionKey<CollapseContext> = Symbol('ui-collapse')
