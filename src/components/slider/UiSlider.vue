<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { Key } from '@/a11y/keys'
import {
  useControllable,
  useModelWasPassed,
  usePropWasPassed,
} from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'
import type { SliderEdge } from './range'
import { slideRange } from './range'

type SliderValue = number | readonly [number, number]
type Thumb = 'single' | 'low' | 'high'

const {
  modelValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  range = false,
  disabled,
  invalid,
  id,
  name,
  label = 'Value',
} = defineProps<{
  modelValue?: SliderValue
  defaultValue?: SliderValue
  min?: number
  max?: number
  step?: number
  range?: boolean
  disabled?: boolean
  invalid?: boolean
  id?: string
  name?: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SliderValue]
  change: [value: SliderValue]
}>()

const trackRef = useTemplateRef<HTMLElement>('track')
const lowThumbRef = useTemplateRef<HTMLElement>('lowThumb')
const highThumbRef = useTemplateRef<HTMLElement>('highThumb')
const active = ref<Thumb | null>(null)
const modelPassed = useModelWasPassed()
const defaultPassed = usePropWasPassed('defaultValue')
const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => false,
})

function isPair(value: SliderValue | undefined): value is readonly [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

function clamp(value: number): number {
  const safeStep = step > 0 ? step : 1
  const snapped = min + Math.round((value - min) / safeStep) * safeStep
  const bounded = Math.min(max, Math.max(min, snapped))
  return Number(bounded.toPrecision(12))
}

function normalize(low: number, high: number): [number, number] {
  const start = clamp(Math.min(low, high))
  const end = clamp(Math.max(low, high))
  return [Math.min(start, end), Math.max(start, end)]
}

const single = useControllable<number>({
  value: () => (range || typeof modelValue !== 'number' ? undefined : modelValue),
  defaultValue: () => (typeof defaultValue === 'number' ? defaultValue : min),
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
})
const span = useControllable<[number, number]>({
  value: () => {
    if (!range || !modelPassed() || !isPair(modelValue)) return undefined
    return [modelValue[0], modelValue[1]]
  },
  defaultValue: () => {
    if (isPair(defaultValue)) return normalize(defaultValue[0], defaultValue[1])
    if (defaultPassed() && typeof defaultValue === 'number') return normalize(min, defaultValue)
    return normalize(min, max)
  },
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
})

const ends = computed(() => normalize(span.value.value[0], span.value.value[1]))
const ratio = computed(() => ratioOf(single.value.value))
const lowRatio = computed(() => ratioOf(ends.value[0]))
const highRatio = computed(() => ratioOf(ends.value[1]))

function ratioOf(value: number): number {
  const width = max - min
  if (width <= 0) return 0
  return (clamp(value) - min) / width
}

function valueFromClient(clientX: number): number {
  const track = trackRef.value
  if (!track) return range ? ends.value[0] : single.value.value
  const rect = track.getBoundingClientRect()
  if (rect.width <= 0) return range ? ends.value[0] : single.value.value
  return clamp(min + ((clientX - rect.left) / rect.width) * (max - min))
}

function pickThumb(clientX: number): Thumb {
  if (!range) return 'single'
  const value = valueFromClient(clientX)
  const [low, high] = ends.value
  return Math.abs(value - low) <= Math.abs(value - high) ? 'low' : 'high'
}

function move(edge: Thumb, next: number): Thumb {
  if (edge === 'single') {
    single.setValue(clamp(next))
    return 'single'
  }
  const [low, high] = ends.value
  const placed = slideRange(edge, clamp(next), low, high)
  span.setValue(placed.value)
  return placed.edge
}

function setFromPointer(event: PointerEvent): void {
  if (field.isDisabled.value || !active.value) return
  active.value = move(active.value, valueFromClient(event.clientX))
}

function onPointerDown(event: PointerEvent): void {
  const track = trackRef.value
  if (!track || field.isDisabled.value) return
  active.value = pickThumb(event.clientX)
  setFromPointer(event)
  if (event.isTrusted) track.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  const track = trackRef.value
  if (!track?.hasPointerCapture(event.pointerId)) return
  setFromPointer(event)
}

function onPointerUp(): void {
  active.value = null
}

function onSingleKeydown(event: KeyboardEvent): void {
  onKeydown('single', event)
}

function onLowKeydown(event: KeyboardEvent): void {
  onKeydown('low', event)
}

function onHighKeydown(event: KeyboardEvent): void {
  onKeydown('high', event)
}

function onKeydown(edge: Thumb, event: KeyboardEvent): void {
  if (field.isDisabled.value) return
  const current =
    edge === 'high' ? ends.value[1] : edge === 'low' ? ends.value[0] : single.value.value
  const floor = min
  const ceiling = max
  const page = step * 10
  const delta =
    event.key === Key.ArrowRight || event.key === Key.ArrowUp
      ? step
      : event.key === Key.ArrowLeft || event.key === Key.ArrowDown
        ? -step
        : event.key === Key.PageUp
          ? page
          : event.key === Key.PageDown
            ? -page
            : event.key === Key.Home
              ? floor - current
              : event.key === Key.End
                ? ceiling - current
                : 0
  if (delta === 0) return
  event.preventDefault()
  const owner = move(edge, current + delta)
  if (owner === edge || owner === 'single') return
  focusEdge(owner)
}

function focusEdge(edge: SliderEdge): void {
  const thumb = edge === 'high' ? highThumbRef.value : lowThumbRef.value
  thumb?.focus()
}

watch([() => min, () => max, () => step], () => {
  if (range) {
    const next = normalize(span.value.value[0], span.value.value[1])
    if (next[0] !== span.value.value[0] || next[1] !== span.value.value[1]) span.setValue(next)
    return
  }
  const next = clamp(single.value.value)
  if (next !== single.value.value) single.setValue(next)
})
</script>

<template>
  <div
    class="ui-slider"
    :data-disabled="field.isDisabled.value || undefined"
    :data-range="range || undefined"
  >
    <div
      :id="field.controlId.value"
      ref="track"
      class="ui-slider__track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <span
        class="ui-slider__fill"
        :style="
          range
            ? { insetInlineStart: `${lowRatio * 100}%`, width: `${(highRatio - lowRatio) * 100}%` }
            : { width: `${ratio * 100}%` }
        "
      />
      <span
        v-if="!range"
        class="ui-slider__thumb"
        role="slider"
        tabindex="0"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="single.value.value"
        :aria-label="label"
        :aria-invalid="field.isInvalid.value || undefined"
        :aria-disabled="field.isDisabled.value || undefined"
        :style="{ insetInlineStart: `${ratio * 100}%` }"
        @keydown="onSingleKeydown"
      />
      <template v-else>
        <span
          ref="lowThumb"
          class="ui-slider__thumb"
          role="slider"
          tabindex="0"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="ends[0]"
          :aria-label="`${label} minimum`"
          :aria-invalid="field.isInvalid.value || undefined"
          :aria-disabled="field.isDisabled.value || undefined"
          :data-active="active === 'low' || undefined"
          :style="{ insetInlineStart: `${lowRatio * 100}%` }"
          @keydown="onLowKeydown"
        />
        <span
          ref="highThumb"
          class="ui-slider__thumb"
          role="slider"
          tabindex="0"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="ends[1]"
          :aria-label="`${label} maximum`"
          :aria-invalid="field.isInvalid.value || undefined"
          :aria-disabled="field.isDisabled.value || undefined"
          :data-active="active === 'high' || undefined"
          :style="{ insetInlineStart: `${highRatio * 100}%` }"
          @keydown="onHighKeydown"
        />
      </template>
    </div>
    <input v-if="name && !range" type="hidden" :name="name" :value="single.value.value" />
    <template v-else-if="name">
      <input type="hidden" :name="`${name}Min`" :value="ends[0]" />
      <input type="hidden" :name="`${name}Max`" :value="ends[1]" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.ui-slider {
  width: 100%;
  padding-block: var(--ui-space-2);

  &[data-disabled] {
    opacity: 0.45;
  }
}

.ui-slider__track {
  position: relative;
  height: 1.25rem;
  cursor: pointer;
  touch-action: none;

  &::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: 2px;
    translate: 0 -50%;
    border-radius: var(--ui-radius-full);
    background: var(--ui-slider-track, var(--ui-color-border-strong));
  }
}

.ui-slider__fill {
  position: absolute;
  inset-inline-start: 0;
  top: 50%;
  height: 2px;
  translate: 0 -50%;
  border-radius: var(--ui-radius-full);
  background: var(--ui-slider-fill, var(--ui-color-accent));
}

.ui-slider__thumb {
  position: absolute;
  z-index: 1;
  top: 50%;
  width: 1rem;
  height: 1rem;
  translate: -50% -50%;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-full);
  background: var(--ui-slider-thumb, var(--ui-color-surface));
  box-shadow: 0 0 0 1px var(--ui-slider-fill, var(--ui-color-accent));

  &[data-active] {
    z-index: 2;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 3px;
  }
}
</style>
