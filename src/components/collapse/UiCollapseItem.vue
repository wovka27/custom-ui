<script setup lang="ts">
import { computed, inject } from 'vue'
import { collapseKey } from './context'

const {
  name,
  title,
  disabled = false,
} = defineProps<{
  name: string
  title: string
  disabled?: boolean
}>()

defineSlots<{
  default(): unknown
  title(): unknown
}>()

const collapse = inject(collapseKey)
if (!collapse) throw new Error('UiCollapseItem must be used inside UiCollapse.')

const open = computed(() => collapse.isOpen(name))
</script>

<template>
  <section class="ui-collapse__item" :data-open="open || undefined">
    <h3>
      <button
        type="button"
        :aria-expanded="open"
        :aria-controls="`ui-collapse-${name}`"
        :disabled="disabled || undefined"
        @click="collapse?.toggle(name)"
      >
        <slot name="title">{{ title }}</slot>
      </button>
    </h3>
    <div :id="`ui-collapse-${name}`" class="ui-collapse__panel" role="region">
      <div class="ui-collapse__body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ui-collapse__item {
  border-bottom: 1px solid var(--ui-color-border);

  &:last-child {
    border-bottom: 0;
  }
}

h3 {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-block: var(--ui-space-3);
  border: 0;
  background: transparent;
  color: var(--ui-color-fg);
  font: inherit;
  text-align: start;
  cursor: pointer;

  &::after {
    content: '';
    width: 0.45rem;
    height: 0.45rem;
    border-inline-end: 1.5px solid var(--ui-color-muted);
    border-bottom: 1.5px solid var(--ui-color-muted);
    rotate: -45deg;
    transition: rotate var(--ui-duration) var(--ui-ease);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.ui-collapse__item[data-open] button::after {
  rotate: 45deg;
}

.ui-collapse__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--ui-duration-reveal) var(--ui-ease);
}

.ui-collapse__item[data-open] .ui-collapse__panel {
  grid-template-rows: 1fr;
}

.ui-collapse__body {
  overflow: hidden;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-collapse__item[data-open] .ui-collapse__body {
  padding-bottom: var(--ui-space-3);
}
</style>
