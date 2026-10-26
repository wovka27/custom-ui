import { catalog, componentHref, componentTitle } from './catalog'
import { guidePages } from './route'

export interface SiteLink {
  readonly href: string
  readonly label: string
}

export interface SiteNeighbors {
  readonly previous?: SiteLink
  readonly next?: SiteLink
}

export function guideNeighbors(id: string): SiteNeighbors {
  const index = guidePages.findIndex((page) => page.id === id)
  const links = guidePages.map((page) => ({
    href: `#/guide/${page.id}`,
    label: page.title,
  }))
  return neighborsAt(index, links)
}

export function componentNeighbors(name: string): SiteNeighbors {
  const names = catalog.flatMap((group) => group.names)
  const links = names.map((item) => ({
    href: componentHref(item),
    label: componentTitle(item),
  }))
  return neighborsAt(names.indexOf(name), links)
}

function neighborsAt(index: number, links: readonly SiteLink[]): SiteNeighbors {
  if (index < 0) return {}
  const previous = index > 0 ? links[index - 1] : undefined
  const next = index < links.length - 1 ? links[index + 1] : undefined
  return { previous, next }
}
