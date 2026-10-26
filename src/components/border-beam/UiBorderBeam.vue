<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useMediaQuery } from '@/composables/use-media-query'
import type { UiTone } from '@/types/common'
import { beamFigure, beamReach } from './beam'

const {
  tone = 'accent',
  duration = 6,
  delay = 0,
  size = 120,
  width = 2,
  radius,
  reverse = false,
  mirror = false,
  glow = false,
  active = true,
} = defineProps<{
  tone?: UiTone
  duration?: number
  delay?: number
  size?: number
  width?: number
  radius?: number
  reverse?: boolean
  mirror?: boolean
  glow?: boolean
  active?: boolean
}>()

defineSlots<{
  default(): unknown
}>()

const root = useTemplateRef<HTMLElement>('root')
const metrics = ref({ width: 0, height: 0, radius: 0 })
const portion = ref(1)
const mirrorPortion = ref(1)
const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
let timer = 0
let stopped = false

const motion = computed(() => ({
  lap: Number.isFinite(duration) ? Math.max(0.4, duration) : 6,
  wait: Number.isFinite(delay) ? delay : 0,
  length: Number.isFinite(size) ? Math.max(16, size) : 120,
  thickness: Number.isFinite(width) ? Math.max(1, width) : 2,
}))

const shape = computed(() =>
  beamFigure(
    metrics.value.width,
    metrics.value.height,
    motion.value.thickness,
    metrics.value.radius,
    motion.value.length,
  ),
)

const reach = computed(() => beamReach(shape.value.span, motion.value.length, portion.value))
const paired = computed(() => beamReach(shape.value.span, motion.value.length, mirrorPortion.value))

const frame = computed(() => {
  const span = shape.value.span
  const style: Record<string, string> = {
    '--_size': `${reach.value}px`,
    '--_gap': `${Math.max(0, span - reach.value)}px`,
    '--_mirror-size': `${paired.value}px`,
    '--_mirror-gap': `${Math.max(0, span - paired.value)}px`,
    '--_span': `${span}px`,
    '--_width': `${motion.value.thickness}px`,
    '--_duration': `${motion.value.lap}s`,
    '--_delay': `${motion.value.wait}s`,
  }
  if (radius !== undefined && Number.isFinite(radius))
    style['--_radius'] = `${Math.max(0, radius)}px`
  return style
})

function measure() {
  const node = root.value
  if (!node) return
  const box = node.getBoundingClientRect()
  const painted = Number.parseFloat(window.getComputedStyle(node).borderTopLeftRadius)
  const next = {
    width: box.width,
    height: box.height,
    radius: Number.isFinite(painted) ? painted : 0,
  }
  if (
    metrics.value.width === next.width &&
    metrics.value.height === next.height &&
    metrics.value.radius === next.radius
  ) {
    return
  }
  metrics.value = next
}

function clearWander() {
  window.clearTimeout(timer)
  timer = 0
}

function wander(soon = false) {
  clearWander()
  if (stopped || !active || reduce.value) return
  const wait = soon ? 280 + Math.random() * 420 : 800 + Math.random() * 1200
  timer = window.setTimeout(() => {
    if (stopped || !active || reduce.value) return
    portion.value = Math.random()
    if (mirror) mirrorPortion.value = Math.random()
    wander()
  }, wait)
}

let observer: ResizeObserver | undefined

onMounted(() => {
  measure()
  observer = new ResizeObserver(() => {
    measure()
  })
  if (root.value) observer.observe(root.value)
})

onScopeDispose(() => {
  stopped = true
  clearWander()
  observer?.disconnect()
})

watch(
  () => active && !reduce.value,
  (play) => {
    clearWander()
    if (!play) {
      portion.value = 1
      mirrorPortion.value = 1
      return
    }
    wander(true)
  },
  { immediate: true },
)

watch(
  () => [width, radius] as const,
  () => {
    measure()
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    ref="root"
    class="ui-border-beam"
    :style="frame"
    :data-tone="tone"
    :data-reverse="reverse || undefined"
    :data-active="active ? undefined : 'false'"
  >
    <slot />
    <span v-if="shape.span > 0" class="ui-border-beam__clip" aria-hidden="true">
      <svg class="ui-border-beam__rim" :width="shape.width" :height="shape.height">
        <path
          v-if="glow"
          class="ui-border-beam__ray"
          data-glow
          :d="shape.d"
          :pathLength="shape.span * 2"
        />
        <path
          v-if="glow && mirror"
          class="ui-border-beam__ray"
          data-glow
          data-mirror
          :d="shape.d"
          :pathLength="shape.span * 2"
        />
        <path class="ui-border-beam__ray" :d="shape.d" :pathLength="shape.span * 2" />
        <path
          v-if="mirror"
          class="ui-border-beam__ray"
          data-mirror
          :d="shape.d"
          :pathLength="shape.span * 2"
        />
      </svg>
    </span>
  </div>
</template>

<style scoped lang="scss">
.ui-border-beam {
  --_edge: 1px;
  --_color: var(--ui-color-accent);
  position: relative;
  isolation: isolate;
  min-width: 0;
  padding: var(--ui-space-4);
  border: var(--_edge) solid var(--ui-color-border);
  border-radius: var(--_radius, var(--ui-radius-md));

  &[data-tone='neutral'] {
    --_color: var(--ui-color-fg);
  }

  &[data-tone='success'] {
    --_color: var(--ui-color-success);
  }

  &[data-tone='warning'] {
    --_color: var(--ui-color-warning);
  }

  &[data-tone='danger'] {
    --_color: var(--ui-color-danger);
  }

  &[data-tone='info'] {
    --_color: var(--ui-color-info);
  }
}

.ui-border-beam__clip {
  position: absolute;
  z-index: -1;
  overflow: clip;
  inset: calc(var(--_edge) * -1);
  pointer-events: none;
  border-radius: inherit;
}

.ui-border-beam__rim {
  display: block;
}

.ui-border-beam__ray {
  fill: none;
  stroke: var(--_color);
  stroke-width: var(--_width);
  stroke-linecap: round;
  stroke-linejoin: miter;
  stroke-dasharray: var(--_size) var(--_gap);
  transition: stroke-dasharray 1.4s var(--ui-ease);
  animation: ui-border-beam var(--_duration) linear infinite;
  animation-delay: var(--_delay);

  &[data-mirror] {
    stroke-dasharray: var(--_mirror-size) var(--_mirror-gap);
    animation-delay: calc(var(--_delay) - (var(--_duration) / 2));
  }

  &[data-glow] {
    stroke-width: calc(var(--_width) * 7);
    stroke: color-mix(in oklch, var(--_color) 42%, transparent);
    filter: blur(calc(var(--_width) * 3.5));
  }
}

.ui-border-beam[data-reverse] .ui-border-beam__ray {
  animation-direction: reverse;
}

.ui-border-beam[data-active='false'] .ui-border-beam__ray {
  animation: none;
  transition: none;
  stroke-dashoffset: calc(var(--_span) * -0.12);
}

@keyframes ui-border-beam {
  to {
    stroke-dashoffset: calc(var(--_span) * -1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-border-beam__ray {
    animation: none;
    transition: none;
    stroke-dashoffset: calc(var(--_span) * -0.12);
  }
}
</style>
