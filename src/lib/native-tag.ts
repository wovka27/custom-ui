import { isHTMLTag, isSVGTag } from '@vue/shared'
import { warn } from '@/lib/warn'

export function nativeTag(tag: string): string {
  if (tag === 'search') return 'div'
  if (isHTMLTag(tag) || isSVGTag(tag)) return tag
  warn('nativeTag', `"${tag}" is not a native element, so it rendered as a div.`)
  return 'div'
}

export function nativeRole(tag: string): 'search' | undefined {
  return tag === 'search' ? 'search' : undefined
}
