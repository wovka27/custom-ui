<script setup lang="ts">
import { nextTick, onMounted, useId, useTemplateRef, watch } from 'vue'
import { useControllable, usePropWasPassed } from '@/composables/use-controllable'
import { useMediaQuery } from '@/composables/use-media-query'

const {
  navOpen,
  sidebarLabel = 'Primary',
  contentLabel = 'Main',
} = defineProps<{
  navOpen?: boolean
  sidebarLabel?: string
  contentLabel?: string
}>()

const emit = defineEmits<{
  'update:navOpen': [value: boolean]
}>()

defineSlots<{
  default(): unknown
  header(): unknown
  sidebar(): unknown
  footer(): unknown
}>()

const navId = useId()
const mainId = useId()
const sidebarRef = useTemplateRef<HTMLElement>('sidebar')
const compact = useMediaQuery('(max-width: 960px)')
const navWasPassed = usePropWasPassed('navOpen')
const nav = useControllable({
  value: () => (navWasPassed() ? navOpen : undefined),
  defaultValue: true,
  onChange: (next) => {
    emit('update:navOpen', next)
  },
})

function setNav(next: boolean): void {
  nav.setValue(next)
}

onMounted(() => {
  if (compact.value) setNav(false)
})

watch(compact, (isCompact, wasCompact) => {
  if (isCompact && wasCompact === false) setNav(false)
})

watch(
  () => nav.value.value && compact.value,
  (shouldFocus) => {
    if (!shouldFocus) return
    void nextTick(() => {
      sidebarRef.value?.focus()
    })
  },
)
</script>

<template>
  <div class="ui-shell" :data-nav="nav.value.value ? 'open' : 'closed'">
    <a class="ui-shell__skip" :href="`#${mainId}`">Skip to content</a>
    <header class="ui-shell__header">
      <button
        class="ui-shell__toggle"
        type="button"
        :aria-expanded="nav.value.value"
        :aria-controls="navId"
        @click="setNav(!nav.value.value)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
        <span class="ui-sr-only">{{
          nav.value.value ? 'Hide navigation' : 'Show navigation'
        }}</span>
      </button>
      <div class="ui-shell__header-content">
        <slot name="header" />
      </div>
    </header>
    <div class="ui-shell__frame">
      <nav
        :id="navId"
        ref="sidebar"
        class="ui-shell__sidebar"
        :aria-label="sidebarLabel"
        :inert="nav.value.value ? undefined : true"
        tabindex="-1"
      >
        <slot name="sidebar" />
      </nav>
      <button
        v-if="nav.value.value && compact"
        class="ui-shell__scrim"
        type="button"
        aria-label="Close navigation"
        @click="setNav(false)"
      />
      <main :id="mainId" class="ui-shell__main" :aria-label="contentLabel">
        <slot />
      </main>
    </div>
    <footer v-if="$slots.footer" class="ui-shell__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--ui-color-bg);
  color: var(--ui-color-fg);
}

.ui-shell__skip {
  position: absolute;
  top: var(--ui-space-3);
  left: var(--ui-space-3);
  z-index: 80;
  transform: translateY(-160%);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-accent);
  color: var(--ui-color-accent-fg);
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
  text-decoration: none;

  &:focus {
    transform: none;
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}

.ui-shell__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  min-height: 3.5rem;
  padding-inline: var(--ui-space-4);
  border-bottom: 1px solid var(--ui-color-border);
  background: var(--ui-color-bg);
}

.ui-shell__header-content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  min-width: 0;
}

.ui-shell__toggle {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  cursor: pointer;

  @include focus-ring(1px);

  svg {
    width: 1rem;
    height: 1rem;
  }
}

.ui-shell__frame {
  display: grid;
  grid-template-columns: var(--ui-sidebar-width) minmax(0, 1fr);
  flex: 1;
  min-height: 0;
}

.ui-shell[data-nav='closed'] .ui-shell__frame {
  grid-template-columns: minmax(0, 1fr);
}

.ui-shell[data-nav='closed'] .ui-shell__sidebar {
  display: none;
}

.ui-shell__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  min-height: 0;
  padding: var(--ui-space-4);
  overflow: auto;
  border-inline-end: 1px solid var(--ui-color-border);
  background: var(--ui-color-bg);

  &:focus {
    outline: none;
  }
}

.ui-shell__main {
  min-width: 0;
  padding: var(--ui-space-6) var(--ui-space-5);
  overflow: auto;
}

.ui-shell__footer {
  padding: var(--ui-space-3) var(--ui-space-5);
  border-top: 1px solid var(--ui-color-border);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-shell__scrim {
  position: fixed;
  inset: 0;
  z-index: calc(var(--ui-z-overlay) - 1);
  padding: 0;
  border: 0;
  background: var(--ui-color-overlay);
  cursor: pointer;
}

@media (max-width: 960px) {
  .ui-shell__frame,
  .ui-shell[data-nav='closed'] .ui-shell__frame {
    grid-template-columns: minmax(0, 1fr);
  }

  .ui-shell[data-nav='open'] .ui-shell__sidebar {
    position: fixed;
    z-index: var(--ui-z-overlay);
    inset: 0 auto 0 0;
    display: flex;
    width: min(18rem, 88vw);
    box-shadow: var(--ui-shadow-pop);
  }

  .ui-shell__main {
    padding: var(--ui-space-5) var(--ui-space-4);
  }
}
</style>
