<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { clampNumber } from '@/components/number-field'

const {
  modelValue,
  defaultValue = 50,
  label = 'Compare',
} = defineProps<{
  modelValue?: number
  defaultValue?: number
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

defineSlots<{
  before(): unknown
  after(): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const root = useTemplateRef<HTMLElement>('root')
const dragging = ref(false)
const position = computed(() => clampNumber(state.value.value, 0, 100))

function setFromPointer(event: PointerEvent): void {
  const frame = root.value
  if (!frame) return
  const rect = frame.getBoundingClientRect()
  if (rect.width === 0) return
  const rtl = window.getComputedStyle(frame).direction === 'rtl'
  const ratio = (event.clientX - rect.left) / rect.width
  state.setValue(clampNumber((rtl ? 1 - ratio : ratio) * 100, 0, 100))
}

function onPointerDown(event: PointerEvent): void {
  if (!(event.currentTarget instanceof HTMLElement)) return
  dragging.value = true
  if (event.isTrusted) event.currentTarget.setPointerCapture(event.pointerId)
  setFromPointer(event)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  setFromPointer(event)
}
</script>

<template>
  <div
    ref="root"
    class="ui-compare"
    role="slider"
    tabindex="0"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(position)"
    :aria-valuetext="`${Math.round(position)} percent after`"
    :style="{ '--_cut': `${position}%` }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="dragging = false"
    @pointercancel="dragging = false"
    @keydown.left.prevent="state.setValue(clampNumber(position - 5, 0, 100))"
    @keydown.right.prevent="state.setValue(clampNumber(position + 5, 0, 100))"
  >
    <div class="ui-compare__layer"><slot name="before" /></div>
    <div class="ui-compare__layer ui-compare__after">
      <slot name="after" />
    </div>
    <span class="ui-compare__line" :style="{ insetInlineStart: `${position}%` }" aria-hidden="true" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-compare {
  @include surface;
  position: relative;
  isolation: isolate;
  min-height: 8rem;
  overflow: hidden;
  cursor: ew-resize;
  touch-action: none;

  @include focus-ring(2px);
}

.ui-compare__layer {
  display: grid;
  place-items: center;
  min-height: 8rem;
  padding: var(--ui-space-4);
}

.ui-compare__after {
  position: absolute;
  inset: 0;
  background: var(--ui-color-accent-subtle);
  clip-path: inset(0 0 0 var(--_cut, 50%));
}

:dir(rtl) .ui-compare__after {
  clip-path: inset(0 var(--_cut, 50%) 0 0);
}

.ui-compare__line {
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--ui-color-accent);
  transform: translateX(-50%);
}

:dir(rtl) .ui-compare__line {
  transform: translateX(50%);
}
</style>
