<script setup lang="ts">
import { computed } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'

const {
  modelValue,
  defaultValue = 0,
  max = 5,
  readonly = false,
  disabled = false,
  label = 'Rating',
} = defineProps<{
  modelValue?: number
  defaultValue?: number
  max?: number
  readonly?: boolean
  disabled?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

const stars = computed(() => Array.from({ length: Math.max(1, max) }, (_, index) => index + 1))
const summary = computed(() => `${state.value.value} of ${stars.value.length}`)

const locked = computed(() => readonly || disabled)

function choose(value: number): void {
  if (locked.value) return
  state.setValue(value === state.value.value ? 0 : value)
}

function onKey(event: KeyboardEvent, value: number): void {
  if (locked.value) return
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    state.setValue(Math.min(stars.value.length, value + 1))
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    state.setValue(Math.max(0, value - 1))
  }
}
</script>

<template>
  <div
    class="ui-rate"
    :role="locked ? 'img' : 'radiogroup'"
    :aria-label="locked ? `${label}, ${summary}` : label"
    :aria-disabled="disabled || undefined"
  >
    <button
      v-for="star in stars"
      :key="star"
      type="button"
      :role="locked ? undefined : 'radio'"
      :aria-checked="locked ? undefined : state.value.value === star"
      :aria-label="`${star} of ${stars.length}`"
      :tabindex="locked ? -1 : 0"
      :disabled="disabled"
      :data-on="star <= state.value.value ? 'true' : undefined"
      @click="choose(star)"
      @keydown="onKey($event, star)"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.6 9.7 5.4l4.1.6-3 2.9.7 4.1L8 11.1 4.5 13l.7-4.1-3-2.9 4.1-.6z" />
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-rate {
  display: inline-flex;
  gap: 0.1rem;
}

button {
  @include icon-control(1.75rem);
  color: var(--ui-color-border-strong);

  svg {
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
    stroke-linejoin: round;
  }

  &[data-on] {
    color: var(--ui-color-accent);

    svg {
      fill: currentColor;
    }
  }
}
</style>
