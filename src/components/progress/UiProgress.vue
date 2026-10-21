<script setup lang="ts">
import { computed } from 'vue'
import type { UiSize } from '@/types/common'
import { usePropWasPassed } from '@/composables/use-controllable'

const {
  value = 0,
  max = 100,
  label,
  indeterminate = false,
  variant = 'line',
  size = 'md',
  showValue,
  steps = 5,
} = defineProps<{
  value?: number
  max?: number
  label?: string
  indeterminate?: boolean
  variant?: 'line' | 'bar' | 'circle' | 'steps'
  size?: UiSize
  showValue?: boolean
  steps?: number
}>()

const showValuePassed = usePropWasPassed('showValue')
const safeMax = computed(() => (max > 0 ? max : 100))
const ratio = computed(() => Math.min(1, Math.max(0, value / safeMax.value)))
const percent = computed(() => Math.round(ratio.value * 100))
const valueVisible = computed(() =>
  showValuePassed() ? showValue : variant === 'line' || variant === 'circle',
)
const stepCount = computed(() => Math.max(2, Math.min(12, Math.round(steps))))
const filledSteps = computed(() => Math.round(ratio.value * stepCount.value))
const stepMarks = computed(() => Array.from({ length: stepCount.value }, (_, index) => index + 1))
const circle = computed(() => {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  return {
    radius,
    circumference,
    offset: circumference * (1 - ratio.value),
  }
})
</script>

<template>
  <div
    class="ui-progress"
    :data-variant="variant"
    :data-size="size"
    :data-indeterminate="indeterminate || undefined"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="indeterminate ? undefined : 0"
    :aria-valuemax="indeterminate ? undefined : safeMax"
    :aria-valuenow="indeterminate ? undefined : value"
    :aria-valuetext="indeterminate ? 'Loading' : `${percent}%`"
  >
    <div v-if="variant !== 'circle' && (label || valueVisible)" class="ui-progress__meta">
      <span v-if="label">{{ label }}</span>
      <span v-if="valueVisible && !indeterminate" class="ui-progress__value">{{ percent }}%</span>
    </div>
    <div v-if="variant === 'steps'" class="ui-progress__steps" aria-hidden="true">
      <span
        v-for="mark in stepMarks"
        :key="mark"
        :data-on="!indeterminate && mark <= filledSteps ? '' : undefined"
        :style="indeterminate ? { animationDelay: `${(mark - 1) * 90}ms` } : undefined"
      />
    </div>
    <div v-else-if="variant === 'circle'" class="ui-progress__ring">
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" :r="circle.radius" />
        <circle
          cx="22"
          cy="22"
          :r="circle.radius"
          :stroke-dasharray="circle.circumference"
          :stroke-dashoffset="indeterminate ? circle.circumference * 0.72 : circle.offset"
        />
      </svg>
      <span v-if="valueVisible && !indeterminate">{{ percent }}</span>
    </div>
    <span v-else class="ui-progress__track">
      <span
        class="ui-progress__fill"
        :data-indeterminate="indeterminate || undefined"
        :style="indeterminate ? undefined : { transform: `scaleX(${ratio})` }"
      />
    </span>
  </div>
</template>

<style scoped lang="scss">
.ui-progress {
  display: grid;
  align-content: start;
  gap: var(--ui-space-2);
  width: 100%;
  min-width: 0;
  color: var(--ui-progress-fill, var(--ui-color-accent));

  &[data-variant='circle'] {
    width: max-content;
    gap: 0;
  }
}

.ui-progress__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.01em;
}

.ui-progress__value {
  margin-inline-start: auto;
  color: var(--ui-color-fg);
  font-variant-numeric: tabular-nums;
}

.ui-progress__track {
  position: relative;
  display: block;
  overflow: hidden;
  height: 2px;
  border-radius: var(--ui-radius-full);
  background: var(--ui-progress-track, var(--ui-color-border));
}

.ui-progress[data-variant='bar'] .ui-progress__track {
  height: 6px;
}

.ui-progress[data-variant='bar'][data-size='sm'] .ui-progress__track {
  height: 4px;
}

.ui-progress[data-variant='bar'][data-size='lg'] .ui-progress__track {
  height: 8px;
}

.ui-progress__fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--ui-duration) var(--ui-ease);

  &[data-indeterminate] {
    width: 32%;
    transform: none;
    animation: ui-progress-slide 1.1s var(--ui-ease) infinite;
  }
}

.ui-progress__steps {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
}

.ui-progress__steps > span {
  height: 4px;
  border-radius: var(--ui-radius-full);
  background: var(--ui-progress-track, var(--ui-color-border));
}

.ui-progress[data-size='sm'] .ui-progress__steps > span {
  height: 3px;
}

.ui-progress[data-size='lg'] .ui-progress__steps > span {
  height: 6px;
}

.ui-progress__steps > span[data-on] {
  background: currentColor;
}

.ui-progress[data-indeterminate][data-variant='steps'] .ui-progress__steps > span {
  animation: ui-progress-step 1.1s var(--ui-ease) infinite;
}

.ui-progress__ring {
  position: relative;
  width: 3.25rem;
  height: 3.25rem;
}

.ui-progress[data-size='sm'] .ui-progress__ring {
  width: 2.5rem;
  height: 2.5rem;
}

.ui-progress[data-size='lg'] .ui-progress__ring {
  width: 4.5rem;
  height: 4.5rem;
}

svg {
  width: 100%;
  height: 100%;
  rotate: -90deg;
}

.ui-progress[data-indeterminate][data-variant='circle'] svg {
  animation: ui-progress-spin 1s linear infinite;
}

circle {
  fill: none;
  stroke: var(--ui-progress-track, var(--ui-color-border));
  stroke-width: 2;
}

circle + circle {
  stroke: currentColor;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--ui-duration) var(--ui-ease);
}

.ui-progress__ring > span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
  font-variant-numeric: tabular-nums;
}

@keyframes ui-progress-slide {
  from {
    translate: -120% 0;
  }
  to {
    translate: 340% 0;
  }
}

@keyframes ui-progress-step {
  0%,
  100% {
    opacity: 0.28;
  }
  45% {
    opacity: 1;
  }
}

@keyframes ui-progress-spin {
  from {
    rotate: -90deg;
  }
  to {
    rotate: 270deg;
  }
}
</style>
