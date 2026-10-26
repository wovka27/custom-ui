<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { UiTone } from '@/types/common'
import { qrFigure } from './qr'
import type { QrLevel, QrShape } from './qr'

const {
  value,
  label = '',
  level = 'M',
  shape = 'square',
  tone = 'neutral',
  size = 160,
  quiet = 4,
} = defineProps<{
  /** Text encoded into the symbol. */
  value: string
  /** Accessible name. Shown under the symbol when no caption slot is passed. */
  label?: string
  /** Error correction. Use H when a center mark covers modules. */
  level?: QrLevel
  /** Module drawing. Finder eyes stay square so the symbol can still be scanned. */
  shape?: QrShape
  tone?: UiTone
  /** Drawn size, in pixels. */
  size?: number
  /** Quiet modules around the symbol. */
  quiet?: number
}>()

defineSlots<{
  caption?(): unknown
  mark?(): unknown
}>()

const slots = useSlots()

const frame = computed(() => {
  const edge = Number.isFinite(size) ? Math.max(64, Math.round(size)) : 160
  const margin = Number.isFinite(quiet) ? Math.min(8, Math.max(0, Math.round(quiet))) : 4
  return {
    edge,
    picture: qrFigure(value, level, shape, margin),
  }
})

const accessible = computed(() => {
  const name = label || value || 'QR code'
  return frame.value.picture ? name : `${name}, too long`
})
</script>

<template>
  <div
    class="ui-qr"
    role="img"
    :aria-label="accessible"
    :data-tone="tone"
    :data-shape="shape"
    :style="{ '--_size': `${frame.edge}px` }"
  >
    <div class="ui-qr__plate">
      <svg
        v-if="frame.picture"
        class="ui-qr__symbol"
        :viewBox="`0 0 ${frame.picture.view} ${frame.picture.view}`"
        aria-hidden="true"
      >
        <path :d="frame.picture.d" />
      </svg>
      <span v-else class="ui-qr__empty" aria-hidden="true" />
      <span v-if="frame.picture && slots.mark" class="ui-qr__mark" aria-hidden="true">
        <slot name="mark" />
      </span>
    </div>
    <p v-if="label || slots.caption" class="ui-qr__caption">
      <slot name="caption">{{ label }}</slot>
    </p>
  </div>
</template>

<style scoped lang="scss">
.ui-qr {
  display: inline-grid;
  justify-items: center;
  gap: var(--ui-space-2);
  max-width: 100%;
  color: var(--ui-color-ink);

  &[data-tone='accent'] {
    color: var(--ui-color-accent);
  }

  &[data-tone='success'] {
    color: var(--ui-color-success);
  }

  &[data-tone='warning'] {
    color: var(--ui-color-warning);
  }

  &[data-tone='danger'] {
    color: var(--ui-color-danger);
  }

  &[data-tone='info'] {
    color: var(--ui-color-info);
  }
}

.ui-qr__plate {
  position: relative;
  width: var(--_size);
  height: var(--_size);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-paper);
}

.ui-qr__symbol,
.ui-qr__empty {
  display: block;
  width: 100%;
  height: 100%;
}

.ui-qr__symbol path {
  fill: currentColor;
}

.ui-qr__mark {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 20%;
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-paper);
  color: currentColor;
  font-size: var(--ui-font-size-xs);
  font-weight: 650;
  transform: translate(-50%, -50%);
}

.ui-qr__caption {
  max-width: var(--_size);
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  line-height: 1.3;
  text-align: center;
}
</style>
