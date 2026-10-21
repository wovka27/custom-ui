<script setup lang="ts">
import { onMounted, onScopeDispose, ref, watch } from 'vue'

export interface UiAnchorItem {
  id: string
  title: string
}

const { items, label = 'On this page', offset = 12 } = defineProps<{
  items: readonly UiAnchorItem[]
  label?: string
  offset?: number
}>()

const active = ref<string | null>(null)
let observer: IntersectionObserver | null = null

function scrollParent(node: HTMLElement): HTMLElement | null {
  let current = node.parentElement
  while (current) {
    const style = globalThis.getComputedStyle(current)
    const scrolls = /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 1
    if (scrolls) return current
    current = current.parentElement
  }
  return null
}

function scrollToId(id: string): void {
  const node = document.getElementById(id)
  if (!node) return
  const scroller = scrollParent(node)
  if (scroller) {
    const top =
      node.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - offset
    scroller.scrollTo({ top, behavior: 'smooth' })
  } else {
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  active.value = id
  globalThis.history.replaceState(null, '', `#${id}`)
}

function onClick(event: MouseEvent, id: string): void {
  event.preventDefault()
  scrollToId(id)
}

function observe(): void {
  observer?.disconnect()
  const firstId = items[0]?.id
  const first = firstId ? document.getElementById(firstId) : null
  if (!first) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)
      const next = visible[0]?.target
      if (next instanceof HTMLElement && next.id) active.value = next.id
    },
    {
      root: scrollParent(first),
      rootMargin: '-15% 0px -55% 0px',
      threshold: [0, 0.25],
    },
  )
  for (const item of items) {
    const node = document.getElementById(item.id)
    if (node) observer.observe(node)
  }
  if (!active.value && firstId) active.value = firstId
}

onMounted(observe)
watch(
  () => items.map((item) => item.id).join('\0'),
  () => {
    observe()
  },
)
onScopeDispose(() => {
  observer?.disconnect()
})
</script>

<template>
  <nav class="ui-anchor" :aria-label="label">
    <a
      v-for="item in items"
      :key="item.id"
      :href="`#${item.id}`"
      :aria-current="active === item.id ? 'location' : undefined"
      @click="onClick($event, item.id)"
    >
      {{ item.title }}
    </a>
  </nav>
</template>

<style scoped lang="scss">
.ui-anchor {
  display: grid;
  align-content: start;
  gap: 0.15rem;
  min-width: 0;
}

a {
  padding: 0.35rem 0.6rem;
  border-inline-start: 1px solid var(--ui-color-border);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;

  &:hover {
    color: var(--ui-color-fg);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }

  &[aria-current='location'] {
    border-inline-start-color: var(--ui-color-accent);
    color: var(--ui-color-fg);
  }
}
</style>
