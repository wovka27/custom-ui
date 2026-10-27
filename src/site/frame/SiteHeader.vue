<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, useTemplateRef } from 'vue'
import { UiBadge, UiButton, UiInput, UiKbd, UiSegmented } from '@/index'
import type { UiTheme } from '@/index'
import { catalog, componentHref, componentTitle } from '../catalog'
import type { SiteSection } from '../route'
import { usePackageVersion } from '../version'

const { theme, section } = defineProps<{
  theme: UiTheme
  section: SiteSection
}>()

const emit = defineEmits<{
  'update:theme': [theme: UiTheme]
}>()

const version = usePackageVersion()
const repo = 'https://github.com/wovka27/custom-ui'
const query = ref('')
const searchRoot = useTemplateRef<HTMLElement>('searchRoot')
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
const links = [
  { id: 'guide', href: '#/guide/installation', label: 'Guide' },
  { id: 'component', href: '#/component', label: 'Component' },
  { id: 'resource', href: '#/resource', label: 'Resource' },
] as const

const hits = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return []
  const found: { name: string; title: string; href: string; group: string }[] = []
  for (const group of catalog) {
    for (const name of group.names) {
      const title = componentTitle(name)
      if (!name.toLowerCase().includes(needle) && !title.toLowerCase().includes(needle)) continue
      found.push({ name, title, href: componentHref(name), group: group.title })
      if (found.length === 8) return found
    }
  }
  return found
})

function setTheme(value: string | number): void {
  if (value === 'light' || value === 'dark' || value === 'system') emit('update:theme', value)
}

function focusSearch(): void {
  searchRoot.value?.querySelector('input')?.focus()
}

function onKey(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    focusSearch()
  }
}

function onHash(): void {
  query.value = ''
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('hashchange', onHash)
})

onScopeDispose(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('hashchange', onHash)
})
</script>

<template>
  <a class="skip" href="#content">Skip to content</a>
  <header class="shell">
    <div class="bar site-measure">
      <a class="word" href="#/">
        <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
          <rect class="plate" width="32" height="32" rx="4" />
          <rect class="edge" x="0.5" y="0.5" width="31" height="31" rx="3.5" />
          <path class="ink" d="M9.65 10V17.2A3.8 3.8 0 0 0 17.25 17.2V10" />
          <path class="ink" d="M22.35 15.4V21" />
          <rect class="dot" x="21.2" y="10" width="2.3" height="2.3" />
        </svg>
        Custom UI
        <ui-badge>{{ version }}</ui-badge>
      </a>
      <nav class="nav" aria-label="Site">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.href"
          :aria-current="section === link.id ? 'page' : undefined"
        >
          {{ link.label }}
        </a>
      </nav>
      <div class="tools">
        <div ref="searchRoot" class="search" :data-hint="query.length === 0 || undefined">
          <ui-input
            v-model="query"
            size="sm"
            placeholder="Search"
            aria-label="Search components"
            autocomplete="off"
          />
          <span v-if="query.length === 0" class="hint" aria-hidden="true">
            <ui-kbd>Ctrl</ui-kbd>
            <ui-kbd>K</ui-kbd>
          </span>
          <ul v-if="query.trim()" class="hits">
            <li v-for="hit in hits" :key="hit.name">
              <a :href="hit.href" @click="query = ''">
                <span>{{ hit.title }}</span>
                <span>{{ hit.group }}</span>
              </a>
            </li>
            <li v-if="hits.length === 0" class="empty">Nothing matches.</li>
          </ul>
        </div>
        <ui-segmented
          :model-value="theme"
          :options="themes"
          label="Color theme"
          size="sm"
          @update:model-value="setTheme"
        />
        <ui-button :href="repo" target="_blank" rel="noreferrer" size="sm" variant="ghost">
          GitHub
        </ui-button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.skip {
  position: absolute;
  left: var(--ui-space-3);
  top: var(--ui-space-3);
  z-index: calc(var(--ui-z-dropdown) + 1);
  transform: translateY(-160%);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-accent);
  color: var(--ui-color-accent-fg);
  text-decoration: none;
}

.skip:focus {
  transform: none;
}

.shell {
  position: sticky;
  top: 0;
  z-index: var(--ui-z-dropdown);
  border-bottom: 1px solid var(--ui-color-border);
  background: color-mix(in oklch, var(--ui-color-bg) 88%, transparent);
  backdrop-filter: blur(16px);
}

.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-4);
  min-height: 3.5rem;
  padding-block: var(--ui-space-2);
}

.word {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-color-fg);
  font-family: var(--ui-font-display);
  font-weight: 650;
  letter-spacing: -0.03em;
  white-space: nowrap;
  text-decoration: none;
}

.mark {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
}

.mark .plate {
  fill: var(--ui-color-bg);
}

.mark .edge {
  fill: none;
  stroke: var(--ui-color-border-strong);
  stroke-width: 1;
}

.mark .ink {
  fill: none;
  stroke: var(--ui-color-fg);
  stroke-width: 2.3;
}

.mark .dot {
  fill: var(--ui-color-accent);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-1) var(--ui-space-4);
}

.nav a {
  padding-block: var(--ui-space-1);
  border-bottom: 1px solid transparent;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

.nav a:hover {
  color: var(--ui-color-fg);
}

.nav a[aria-current='page'] {
  border-bottom-color: var(--ui-color-accent);
  color: var(--ui-color-fg);
}

.tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
  margin-left: auto;
}

.search {
  position: relative;
  width: 13.5rem;
}

.search[data-hint] :deep(.ui-input__control) {
  padding-right: 4.4rem;
}

.hint {
  position: absolute;
  top: 50%;
  right: 0.4rem;
  display: flex;
  gap: 0.2rem;
  pointer-events: none;
  transform: translateY(-50%);
}

.hits {
  position: absolute;
  z-index: 2;
  top: calc(100% + var(--ui-space-1));
  left: 0;
  right: 0;
  margin: 0;
  padding: var(--ui-space-1);
  list-style: none;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  box-shadow: var(--ui-shadow-pop);
}

.hits a {
  display: flex;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

.hits a span:last-child,
.empty {
  color: var(--ui-color-muted);
}

.hits a:hover {
  background: var(--ui-color-subtle);
}

.empty {
  padding: var(--ui-space-2);
  font-size: var(--ui-font-size-sm);
}

.word:focus-visible,
.nav a:focus-visible,
.hits a:focus-visible,
.skip:focus-visible {
  outline: 2px solid var(--ui-color-focus);
  outline-offset: 3px;
}

@media (max-width: 800px) {
  .tools {
    margin-left: 0;
  }

  .hint {
    display: none;
  }

  .search[data-hint] :deep(.ui-input__control) {
    padding-right: var(--ui-space-3);
  }
}
</style>
