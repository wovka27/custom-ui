import { groupById } from './catalog'

export const guidePages = [
  { id: 'installation', title: 'Installation', group: 'Start' },
  { id: 'quick-start', title: 'Quick start', group: 'Start' },
  { id: 'state', title: 'State', group: 'Customization' },
  { id: 'theming', title: 'Theming', group: 'Customization' },
  { id: 'tokens', title: 'Tokens', group: 'Customization' },
] as const

export type GuideId = (typeof guidePages)[number]['id']

export type SiteSection = 'home' | 'guide' | 'component' | 'resource'

export type SiteRoute =
  | { readonly kind: 'home' }
  | { readonly kind: 'guide'; readonly page: GuideId }
  | { readonly kind: 'components'; readonly group?: string }
  | { readonly kind: 'component'; readonly slug: string }
  | { readonly kind: 'resource' }

const guideIds = new Set<string>(guidePages.map((page) => page.id))

function isGuideId(value: string | undefined): value is GuideId {
  return value !== undefined && guideIds.has(value)
}

export function parseHash(hash: string): SiteRoute {
  const raw = hash.replace(/^#/, '').replace(/^\/+/, '')
  const parts = raw.split('/').filter((part) => part.length > 0)
  const head = parts[0]
  const second = parts[1]
  if (head === undefined || head === 'mark') return { kind: 'home' }
  if (head === 'guide' || head === 'score') {
    if (head === 'score') return { kind: 'guide', page: 'theming' }
    return { kind: 'guide', page: isGuideId(second) ? second : 'installation' }
  }
  if (head === 'index') return { kind: 'components' }
  if (head === 'component') {
    if (second === undefined) return { kind: 'components' }
    if (groupById(second)) return { kind: 'components', group: second }
    return { kind: 'component', slug: second }
  }
  if (head === 'resource') return { kind: 'resource' }
  if (groupById(head)) return { kind: 'components', group: head }
  return { kind: 'home' }
}

export function sectionOf(route: SiteRoute): SiteSection {
  if (route.kind === 'components' || route.kind === 'component') return 'component'
  return route.kind
}

export function documentTitle(route: SiteRoute, componentTitle: string | undefined): string {
  if (route.kind === 'home') return 'Custom UI'
  if (route.kind === 'guide') {
    const page = guidePages.find((item) => item.id === route.page)
    return `${page?.title ?? 'Guide'} | Custom UI`
  }
  if (route.kind === 'components') return 'Components | Custom UI'
  if (route.kind === 'component') return `${componentTitle ?? 'Component'} | Custom UI`
  return 'Resources | Custom UI'
}
