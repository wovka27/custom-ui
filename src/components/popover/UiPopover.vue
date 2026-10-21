<script setup lang="ts">
import { computed, onScopeDispose, useId, useTemplateRef, watch } from 'vue'
import {
  useAnchoredPosition,
  type UiFloatingAlign,
  type UiFloatingSide,
} from '@/composables/use-anchored-position'
import { useControllable, usePropWasPassed } from '@/composables/use-controllable'

const {
  open,
  defaultOpen = false,
  trigger = 'click',
  placement = 'bottom',
  align = 'start',
  disabled = false,
  padded = true,
} = defineProps<{
  open?: boolean
  defaultOpen?: boolean
  trigger?: 'click' | 'hover'
  placement?: UiFloatingSide
  align?: UiFloatingAlign
  disabled?: boolean
  padded?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

defineSlots<{
  trigger(props: { open: boolean; toggle: () => void }): unknown
  default(): unknown
}>()

const anchor = `--ui-anchor-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const anchorReady =
  typeof globalThis.CSS?.supports === 'function' &&
  globalThis.CSS.supports('anchor-name: --ui-a') &&
  globalThis.CSS.supports('top: anchor(bottom)') &&
  globalThis.CSS.supports('left: anchor(center)')
const rootRef = useTemplateRef<HTMLElement>('root')
const triggerRef = useTemplateRef<HTMLElement>('trigger')
const panelRef = useTemplateRef<HTMLElement>('panel')
const openWasPassed = usePropWasPassed('open')
const state = useControllable({
  value: () => (openWasPassed() ? open : undefined),
  defaultValue: () => defaultOpen,
  onChange: (next) => {
    emit('update:open', next)
  },
})
const isOpen = computed(() => state.value.value)
const position = useAnchoredPosition(
  () => triggerRef.value,
  () => panelRef.value,
  () => placement,
  () => align,
  () => isOpen.value && !anchorReady,
)
let openTimer = 0
let closeTimer = 0

const triggerStyle = computed(() => (anchorReady ? { anchorName: anchor } : undefined))
const panelStyle = computed(() => (anchorReady ? anchorPanel(anchor, placement, align) : undefined))

function anchorPanel(
  name: string,
  side: UiFloatingSide,
  cross: UiFloatingAlign,
): Record<string, string> {
  const gap = '4px'
  const style: Record<string, string> = {
    positionAnchor: name,
    positionTryFallbacks: 'flip-block, flip-inline',
  }
  if (side === 'bottom') style.top = 'anchor(bottom)'
  else if (side === 'top') style.bottom = 'anchor(top)'
  else if (side === 'end') style.insetInlineStart = 'anchor(end)'
  else style.insetInlineEnd = 'anchor(start)'

  if (side === 'top' || side === 'bottom') {
    style[side === 'bottom' ? 'marginTop' : 'marginBottom'] = gap
    if (cross === 'center') {
      style.left = 'anchor(center)'
      style.translate = '-50% 0'
    } else if (cross === 'end') style.insetInlineEnd = 'anchor(end)'
    else style.insetInlineStart = 'anchor(start)'
    return style
  }

  style[side === 'end' ? 'marginInlineStart' : 'marginInlineEnd'] = gap
  if (cross === 'center') {
    style.top = 'anchor(center)'
    style.translate = '0 -50%'
  } else if (cross === 'end') style.bottom = 'anchor(bottom)'
  else style.top = 'anchor(top)'
  return style
}

function syncPanel(next: boolean): void {
  const panel = panelRef.value
  if (!panel?.isConnected) return
  const opened = panel.matches(':popover-open')
  if (next && !opened) panel.showPopover()
  if (!next && opened) panel.hidePopover()
  if (next && !anchorReady) position.update()
}

function toggle(): void {
  if (disabled) return
  state.setValue(!isOpen.value)
}

function onTriggerClick(): void {
  if (trigger !== 'click') return
  toggle()
}

function onEnter(): void {
  if (trigger !== 'hover' || disabled) return
  window.clearTimeout(closeTimer)
  window.clearTimeout(openTimer)
  openTimer = window.setTimeout(() => state.setValue(true), 280)
}

function onLeave(): void {
  if (trigger !== 'hover') return
  window.clearTimeout(openTimer)
  closeTimer = window.setTimeout(() => state.setValue(false), 120)
}

function onFocusIn(): void {
  if (trigger !== 'hover' || disabled) return
  window.clearTimeout(closeTimer)
  state.setValue(true)
}

function onFocusOut(event: FocusEvent): void {
  if (trigger !== 'hover') return
  const next = event.relatedTarget
  if (next instanceof Node && (rootRef.value?.contains(next) || panelRef.value?.contains(next)))
    return
  state.setValue(false)
}

function onToggle(event: Event): void {
  if (!('newState' in event)) return
  const next = event.newState === 'open'
  if (next === isOpen.value) return
  state.setValue(next)
}

watch([isOpen, () => placement, () => align], ([next]) => {
  syncPanel(next)
})

onScopeDispose(() => {
  window.clearTimeout(openTimer)
  window.clearTimeout(closeTimer)
})
</script>

<template>
  <div
    ref="root"
    class="ui-popover"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div ref="trigger" class="ui-popover__trigger" :style="triggerStyle" @click="onTriggerClick">
      <slot name="trigger" :open="isOpen" :toggle="toggle" />
    </div>
    <div
      ref="panel"
      class="ui-popover__panel"
      :class="{ 'ui-popover__panel--padded': padded }"
      :data-side="placement"
      :popover="trigger === 'hover' ? 'manual' : 'auto'"
      :style="panelStyle"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
      @toggle="onToggle"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-popover {
  position: relative;
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
}

.ui-popover__trigger {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
}

.ui-popover__panel {
  z-index: var(--ui-z-dropdown);
  width: max-content;
  max-width: min(22rem, calc(100vw - 1rem));
  inset: auto;
  margin: 0;
  padding: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);
  opacity: 0;
  transition:
    opacity var(--ui-duration-reveal) var(--ui-ease),
    overlay var(--ui-duration-reveal) allow-discrete,
    display var(--ui-duration-reveal) allow-discrete;

  &:popover-open {
    opacity: 1;
  }
}

.ui-popover__panel--padded {
  padding: var(--ui-space-3);
}

@starting-style {
  .ui-popover__panel:popover-open {
    opacity: 0;
  }
}
</style>
