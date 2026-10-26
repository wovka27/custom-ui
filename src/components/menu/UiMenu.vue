<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useAnchoredPosition } from '@/composables/use-anchored-position'
import { useControllable, usePropWasPassed } from '@/composables/use-controllable'
import type { UiMenuItem } from './menu'

const {
  items = [],
  open,
  defaultOpen = false,
  label = 'Actions',
} = defineProps<{
  items?: readonly UiMenuItem[]
  open?: boolean
  defaultOpen?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  select: [item: UiMenuItem]
}>()

defineSlots<{
  trigger(props: { open: boolean; toggle: () => void }): unknown
  item(props: { item: UiMenuItem; active: boolean }): unknown
  default(): unknown
}>()

const passed = usePropWasPassed('open')
const state = useControllable({
  value: () => (passed() ? open : undefined),
  defaultValue: () => defaultOpen,
  onChange: (next) => {
    emit('update:open', next)
  },
})
const rootRef = useTemplateRef<HTMLElement>('root')
const triggerRef = useTemplateRef<HTMLElement>('trigger')
const panelRef = useTemplateRef<HTMLElement>('panel')
const active = ref(0)
const isOpen = computed(() => state.value.value)
const position = useAnchoredPosition(
  () => triggerRef.value,
  () => panelRef.value,
  'bottom',
  'start',
  () => isOpen.value,
)

function toggle(): void {
  state.setValue(!isOpen.value)
}

function close(): void {
  state.setValue(false)
}

function enabledIndexes(): number[] {
  return items.flatMap((item, index) => (item.disabled ? [] : [index]))
}

function move(step: 1 | -1): void {
  const indexes = enabledIndexes()
  if (indexes.length === 0) return
  const at = indexes.indexOf(active.value)
  const next = indexes[(at + step + indexes.length) % indexes.length]
  if (next !== undefined) active.value = next
}

function choose(item: UiMenuItem): void {
  if (item.disabled) return
  emit('select', item)
  close()
}

function onMenuKey(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    const first = enabledIndexes()[0]
    if (first !== undefined) active.value = first
  } else if (event.key === 'End') {
    event.preventDefault()
    const indexes = enabledIndexes()
    const last = indexes[indexes.length - 1]
    if (last !== undefined) active.value = last
  } else if (event.key === 'Escape') {
    event.preventDefault()
    close()
    const button = triggerRef.value?.querySelector('button')
    if (button instanceof HTMLButtonElement) button.focus()
  }
}

function onPointer(event: PointerEvent): void {
  if (!isOpen.value || !rootRef.value) return
  if (event.target instanceof Node && rootRef.value.contains(event.target)) return
  close()
}

watch(isOpen, async (value) => {
  if (!value) return
  const first = enabledIndexes()[0]
  active.value = first ?? 0
  await nextTick()
  position.update()
})

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', onPointer)
  onScopeDispose(() => {
    window.removeEventListener('pointerdown', onPointer)
  })
}
</script>

<template>
  <div ref="root" class="ui-menu" @keydown.esc.prevent="close">
    <div ref="trigger" class="ui-menu__trigger">
      <slot name="trigger" :open="isOpen" :toggle="toggle">
        <button
          class="ui-menu__button"
          type="button"
          :aria-expanded="isOpen"
          aria-haspopup="menu"
          @click="toggle"
        >
          {{ label }}
        </button>
      </slot>
    </div>
    <div
      v-if="isOpen"
      ref="panel"
      class="ui-menu__panel"
      role="menu"
      :aria-label="label"
      @keydown="onMenuKey"
    >
      <slot v-if="items.length === 0" />
      <button
        v-for="(item, index) in items"
        :key="item.id"
        type="button"
        role="menuitem"
        :disabled="item.disabled"
        :tabindex="index === active ? 0 : -1"
        :data-danger="item.danger ? 'true' : undefined"
        @click="choose(item)"
        @mouseenter="active = index"
      >
        <slot name="item" :item="item" :active="index === active">
          <span>{{ item.label }}</span>
          <span v-if="item.hint" class="ui-menu__hint">{{ item.hint }}</span>
        </slot>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-menu {
  position: relative;
  display: inline-flex;
}

.ui-menu__button {
  @include surface;
  @include focus-ring(2px);
  @include pressable;
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-3);
  font-size: var(--ui-font-size-sm);
  cursor: pointer;
}

.ui-menu__panel {
  @include popup;
  z-index: var(--ui-z-dropdown);
  display: grid;
  min-width: 12rem;
  padding: var(--ui-space-1);
}

button[role='menuitem'] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  width: 100%;
  min-height: 2rem;
  padding-inline: var(--ui-space-2);
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: inherit;
  font-size: var(--ui-font-size-sm);
  text-align: start;
  cursor: pointer;

  @include focus-ring(1px);

  &:hover,
  &:focus-visible {
    background: var(--ui-color-subtle);
  }

  &:disabled {
    cursor: not-allowed;
    color: var(--ui-color-muted);
  }

  &[data-danger] {
    color: var(--ui-color-danger);
  }
}

.ui-menu__hint {
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
}
</style>
