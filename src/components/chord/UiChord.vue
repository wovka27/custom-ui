<script setup lang="ts">
import { computed, ref, useId, useTemplateRef } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { useScoreScheme } from '@/composables/use-score-scheme'
import { ledgerScore, parseScore, scoreVariables } from '@/styles/score'
import type { DesignScore } from '@/styles/score'

const {
  modelValue,
  defaultValue = ledgerScore,
  label = 'Chord',
} = defineProps<{
  modelValue?: DesignScore
  defaultValue?: DesignScore
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DesignScore]
}>()

defineSlots<{
  default(): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const scheme = useScoreScheme()
const current = computed(() => state.value.value)
const painted = computed(() => scoreVariables(current.value, scheme.value))
const track = useTemplateRef<HTMLElement>('track')
const dragging = ref(false)
const labelId = useId()

const grammars = [
  { key: 'ground', label: 'Ground', options: ['void', 'paper', 'fog'] },
  { key: 'shape', label: 'Shape', options: ['square', 'cut', 'soft', 'round'] },
  { key: 'density', label: 'Density', options: ['tight', 'even', 'open'] },
  { key: 'motion', label: 'Motion', options: ['still', 'brief', 'measured'] },
  { key: 'elevation', label: 'Elevation', options: ['flat', 'lift'] },
  { key: 'voice', label: 'Voice', options: ['plain', 'mono'] },
] as const

function choose(key: string, value: string | number): void {
  state.setValue(parseScore({ ...current.value, [key]: value }))
}

function hueFromPointer(event: PointerEvent): void {
  const frame = track.value
  if (!frame) return
  const rect = frame.getBoundingClientRect()
  if (rect.width === 0) return
  const ratio = (event.clientX - rect.left) / rect.width
  choose('hue', Math.min(360, Math.max(0, Math.round(ratio * 360))))
}

function onPointerDown(event: PointerEvent): void {
  if (!(event.currentTarget instanceof HTMLElement)) return
  dragging.value = true
  if (event.isTrusted) event.currentTarget.setPointerCapture(event.pointerId)
  hueFromPointer(event)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  hueFromPointer(event)
}

function onKey(event: KeyboardEvent): void {
  const step = event.key === 'ArrowLeft' ? -4 : event.key === 'ArrowRight' ? 4 : 0
  if (step !== 0) {
    event.preventDefault()
    choose('hue', Math.min(360, Math.max(0, Math.round(current.value.hue + step))))
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    choose('hue', event.key === 'Home' ? 0 : 360)
  }
}
</script>

<template>
  <section class="ui-chord" :style="painted">
    <div class="ui-chord__head">
      <p :id="labelId" class="ui-chord__name">{{ current.name }}</p>
      <div class="ui-chord__marks" aria-hidden="true">
        <span class="ui-chord__mark ui-chord__mark--paper" />
        <span class="ui-chord__mark ui-chord__mark--ink" />
        <span class="ui-chord__mark ui-chord__mark--accent" />
        <span class="ui-chord__mark ui-chord__mark--success" />
        <span class="ui-chord__mark ui-chord__mark--warning" />
        <span class="ui-chord__mark ui-chord__mark--danger" />
      </div>
    </div>
    <div
      ref="track"
      class="ui-chord__hue"
      role="slider"
      tabindex="0"
      :aria-label="label"
      aria-valuemin="0"
      aria-valuemax="360"
      :aria-valuenow="Math.round(current.hue)"
      :aria-valuetext="`${Math.round(current.hue)} degrees`"
      :style="{ '--_hue': `${(current.hue / 360) * 100}%` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="dragging = false"
      @pointercancel="dragging = false"
      @keydown="onKey"
    >
      <span class="ui-chord__thumb" />
    </div>
    <div class="ui-chord__grammar">
      <div v-for="grammar in grammars" :key="grammar.key" class="ui-chord__axis">
        <span :id="`${labelId}-${grammar.key}`">{{ grammar.label }}</span>
        <div role="group" :aria-labelledby="`${labelId}-${grammar.key}`">
          <button
            v-for="option in grammar.options"
            :key="option"
            type="button"
            :aria-pressed="current[grammar.key] === option"
            @click="choose(grammar.key, option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="$slots.default" class="ui-chord__stage">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-chord {
  @include surface;
  display: grid;
  gap: var(--ui-space-4);
  padding: var(--ui-space-4);
  background: var(--ui-color-bg);
  color: var(--ui-color-fg);
  font-family: var(--ui-font-sans);
}

.ui-chord__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
}

.ui-chord__name {
  margin: 0;
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-lg);
  letter-spacing: -0.03em;
}

.ui-chord__marks {
  display: flex;
  gap: var(--ui-space-2);
}

.ui-chord__mark {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
}

.ui-chord__mark--paper {
  background: var(--ui-color-paper);
}

.ui-chord__mark--ink {
  background: var(--ui-color-ink);
}

.ui-chord__mark--accent {
  background: var(--ui-color-accent);
}

.ui-chord__mark--success {
  background: var(--ui-color-success);
}

.ui-chord__mark--warning {
  background: var(--ui-color-warning);
}

.ui-chord__mark--danger {
  background: var(--ui-color-danger);
}

.ui-chord__hue {
  position: relative;
  height: 1.75rem;
  border-radius: var(--ui-radius-full);
  background: linear-gradient(
    90deg,
    oklch(0.7 0.14 0),
    oklch(0.7 0.14 60),
    oklch(0.7 0.14 120),
    oklch(0.7 0.14 180),
    oklch(0.7 0.14 240),
    oklch(0.7 0.14 300),
    oklch(0.7 0.14 360)
  );
  cursor: ew-resize;
  touch-action: none;

  @include focus-ring(2px);
}

.ui-chord__thumb {
  position: absolute;
  top: 50%;
  width: 0.8rem;
  height: 1.4rem;
  border: 1px solid var(--ui-color-paper);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-accent);
  transform: translate(-50%, -50%);
  inset-inline-start: var(--_hue, 50%);
}

.ui-chord__grammar {
  display: grid;
  gap: var(--ui-space-3);
}

.ui-chord__axis {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-chord__axis div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-1);
}

.ui-chord__axis button {
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-2);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-radius, var(--ui-radius-md));
  background: transparent;
  color: var(--ui-color-fg);
  font: inherit;
  cursor: pointer;

  @include focus-ring(2px);
}

.ui-chord__axis button[aria-pressed='true'] {
  border-color: var(--ui-color-accent);
}

.ui-chord__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
  padding-top: var(--ui-space-3);
  border-top: 1px solid var(--ui-color-border);
}

@media (prefers-reduced-motion: reduce) {
  .ui-chord__thumb {
    transition: none;
  }
}
</style>
