<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { normalizeHex, type Hsv } from './color'
import type { UiColorVariant } from './variant'

const { variant, hsv, draft, swatches, color, disabled = false } = defineProps<{
  variant: UiColorVariant
  hsv: Hsv
  draft: string
  swatches: readonly string[]
  color: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  hsv: [value: Hsv]
  commit: [value: string]
  'update:draft': [value: string]
}>()

defineSlots<{
  swatch(props: { color: string; selected: boolean; choose: () => void }): unknown
}>()

const planeRef = useTemplateRef<HTMLElement>('plane')

function point(event: PointerEvent): void {
  const plane = planeRef.value
  if (!plane || disabled) return
  const rect = plane.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return
  const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const v = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
  emit('hsv', { h: hsv.h, s, v })
}

function onPlaneDown(event: PointerEvent): void {
  if (event.isTrusted) planeRef.value?.setPointerCapture(event.pointerId)
  point(event)
}

function onPlaneMove(event: PointerEvent): void {
  if (!planeRef.value?.hasPointerCapture(event.pointerId)) return
  point(event)
}

function onHue(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('hsv', { ...hsv, h: Number(target.value) })
}

function onDraft(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:draft', target.value)
}

function commitDraft(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('commit', target.value)
}

function choose(swatch: string): void {
  emit('commit', swatch)
}
</script>

<template>
  <div class="ui-color__panel" :data-variant="variant">
    <div
      v-if="variant !== 'swatches'"
      ref="plane"
      class="ui-color__plane"
      :style="{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
      }"
      @pointerdown="onPlaneDown"
      @pointermove="onPlaneMove"
    >
      <span class="ui-color__knob" :style="{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }" />
    </div>
    <input
      v-if="variant !== 'swatches'"
      class="ui-color__hue"
      type="range"
      min="0"
      max="360"
      :value="hsv.h"
      aria-label="Hue"
      :disabled="disabled || undefined"
      @input="onHue"
    />
    <input
      class="ui-color__hex"
      :value="draft"
      spellcheck="false"
      aria-label="Hex color"
      :disabled="disabled || undefined"
      @input="onDraft"
      @change="commitDraft"
    />
    <div v-if="swatches.length > 0" class="ui-color__swatches">
      <template v-for="swatch in swatches" :key="swatch">
        <slot
          name="swatch"
          :color="swatch"
          :selected="normalizeHex(swatch) === color"
          :choose="() => choose(swatch)"
        >
          <button
            type="button"
            :aria-label="swatch"
            :aria-pressed="normalizeHex(swatch) === color"
            :style="{ background: swatch }"
            :disabled="disabled || undefined"
            @click="choose(swatch)"
          />
        </slot>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-color__panel {
  display: grid;
  gap: var(--ui-space-3);
  width: 16rem;
  padding: var(--ui-space-3);
}

.ui-color__plane {
  position: relative;
  height: 9rem;
  border-radius: var(--ui-radius-sm);
  touch-action: none;
  cursor: crosshair;
}

.ui-color__knob {
  position: absolute;
  width: 0.8rem;
  height: 0.8rem;
  border: 2px solid white;
  border-radius: var(--ui-radius-full);
  box-shadow: 0 0 0 1px var(--ui-color-fg);
  translate: -50% -50%;
  pointer-events: none;
}

.ui-color__hue {
  width: 100%;
  accent-color: var(--ui-color-accent);
}

.ui-color__hex {
  @include control-field;
  font-family: var(--ui-font-mono);
}

.ui-color__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

.ui-color__swatches button {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  cursor: pointer;
}

.ui-color__swatches button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
