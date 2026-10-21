<script setup lang="ts">
import { computed, nextTick, useId } from 'vue'
import { Key } from '@/a11y/keys'
import { useControllable } from '@/composables/use-controllable'
import { nextEnabledIndex } from '@/lib/dom'
import type { UiTabItem } from './tabs.types'

const {
  tabs,
  label,
  modelValue,
  defaultValue,
  orientation = 'horizontal',
} = defineProps<{
  tabs: readonly UiTabItem[]
  label: string
  modelValue?: string
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const baseId = useId()
const buttons = new Map<string, HTMLButtonElement>()
const firstEnabled = computed(() => tabs.find((tab) => !tab.disabled)?.id ?? '')
const state = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue ?? firstEnabled.value,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

function tabDomId(id: string): string {
  return `${baseId}-tab-${id}`
}

function panelDomId(id: string): string {
  return `${baseId}-panel-${id}`
}

function setButton(id: string, element: unknown): void {
  if (element instanceof HTMLButtonElement) buttons.set(id, element)
  else buttons.delete(id)
}

function isTabDisabled(index: number): boolean {
  return tabs[index]?.disabled === true
}

function resolveTabIndex(
  key: string,
  current: number,
  forward: string,
  backward: string,
): number | undefined {
  if (key === forward) return nextEnabledIndex(tabs.length, current + 1, 1, isTabDisabled)
  if (key === backward) return nextEnabledIndex(tabs.length, current - 1, -1, isTabDisabled)
  if (key === Key.Home) return nextEnabledIndex(tabs.length, 0, 1, isTabDisabled)
  if (key === Key.End) return nextEnabledIndex(tabs.length, tabs.length - 1, -1, isTabDisabled)
  return undefined
}

function selectAt(index: number, focus: boolean): void {
  const tab = tabs[index]
  if (!tab || tab.disabled) return
  state.setValue(tab.id)
  if (!focus) return
  void nextTick(() => {
    buttons.get(tab.id)?.focus()
  })
}

function onKeydown(event: KeyboardEvent): void {
  const current = tabs.findIndex((tab) => tab.id === state.value.value)
  if (current < 0) return
  const forward = orientation === 'horizontal' ? Key.ArrowRight : Key.ArrowDown
  const backward = orientation === 'horizontal' ? Key.ArrowLeft : Key.ArrowUp
  const next = resolveTabIndex(event.key, current, forward, backward)
  if (next === undefined) return
  event.preventDefault()
  if (next >= 0) selectAt(next, true)
}
</script>

<template>
  <div class="ui-tabs" :data-orientation="orientation">
    <div
      class="ui-tabs__list"
      role="tablist"
      :aria-label="label"
      :aria-orientation="orientation"
      @keydown="onKeydown"
    >
      <button
        v-for="tab in tabs"
        :id="tabDomId(tab.id)"
        :key="tab.id"
        :ref="(element) => setButton(tab.id, element)"
        type="button"
        role="tab"
        :aria-selected="state.value.value === tab.id"
        :aria-controls="panelDomId(tab.id)"
        :tabindex="state.value.value === tab.id ? 0 : -1"
        :disabled="tab.disabled || undefined"
        @click="
          selectAt(
            tabs.findIndex((item) => item.id === tab.id),
            false,
          )
        "
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="tab in tabs"
      :id="panelDomId(tab.id)"
      :key="tab.id"
      class="ui-tabs__panel"
      role="tabpanel"
      :aria-labelledby="tabDomId(tab.id)"
      :hidden="state.value.value !== tab.id"
      :tabindex="state.value.value === tab.id ? 0 : undefined"
    >
      <slot :name="tab.id" :tab="tab" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  min-width: 0;

  &[data-orientation='vertical'] {
    flex-direction: row;
    align-items: flex-start;
  }
}

.ui-tabs__list {
  display: flex;
  gap: var(--ui-space-4);
  border-bottom: 1px solid var(--ui-color-border);

  [data-orientation='vertical'] & {
    flex-direction: column;
    align-items: stretch;
    min-width: 11rem;
    border-bottom: 0;
    border-inline-end: 1px solid var(--ui-color-border);
  }
}

.ui-tabs__list button {
  margin-bottom: -1px;
  padding: var(--ui-space-2) 0;
  border: 0;
  border-bottom: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  font-weight: 560;
  cursor: pointer;
  transition:
    color var(--ui-duration) var(--ui-ease),
    border-color var(--ui-duration) var(--ui-ease),
    opacity var(--ui-duration-press) var(--ui-ease);

  &:active:not(:disabled) {
    opacity: 0.72;
  }

  @include focus-ring(1px);

  &[aria-selected='true'] {
    border-bottom-color: var(--ui-color-accent);
    color: var(--ui-color-fg);
  }

  [data-orientation='vertical'] & {
    margin-bottom: 0;
    margin-inline-end: -1px;
    border-bottom: 0;
    border-inline-end: 1px solid transparent;
    text-align: start;

    &[aria-selected='true'] {
      border-inline-end-color: var(--ui-color-accent);
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.ui-tabs__panel {
  min-width: 0;
  flex: 1;

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
    border-radius: var(--ui-radius-sm);
  }
}
</style>
