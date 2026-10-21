<script setup lang="ts">
import { computed, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'

export interface UiTourStep {
  id: string
  title: string
  description: string
  selector: string
}

const {
  modelValue,
  defaultValue = false,
  steps,
  step = 0,
} = defineProps<{
  modelValue?: boolean
  defaultValue?: boolean
  steps: readonly UiTourStep[]
  step?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  'update:step': [step: number]
  finish: []
}>()

defineSlots<{
  default(props: { step: UiTourStep; index: number; count: number }): unknown
}>()

const holeRef = useTemplateRef<HTMLElement>('hole')
const cardRef = useTemplateRef<HTMLElement>('card')
const index = ref(step)
const modelWasPassed = useModelWasPassed()
const state = useControllable({
  value: () => (modelWasPassed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const current = computed(() => steps[index.value])

function place(): void {
  const hole = holeRef.value
  const card = cardRef.value
  const item = current.value
  if (!hole || !card || !item || !state.value.value) return
  const target = document.querySelector(item.selector)
  if (!(target instanceof HTMLElement)) {
    hole.hidden = true
    card.style.top = '20%'
    card.style.left = '50%'
    card.style.translate = '-50% 0'
    return
  }
  const rect = target.getBoundingClientRect()
  hole.hidden = false
  hole.style.top = `${rect.top - 6}px`
  hole.style.left = `${rect.left - 6}px`
  hole.style.width = `${rect.width + 12}px`
  hole.style.height = `${rect.height + 12}px`
  const below = window.innerHeight - rect.bottom
  card.style.translate = '0 0'
  card.style.left = `${Math.min(rect.left, window.innerWidth - card.offsetWidth - 12)}px`
  card.style.top = `${below > card.offsetHeight + 16 ? rect.bottom + 10 : Math.max(8, rect.top - card.offsetHeight - 10)}px`
}

function setStep(next: number): void {
  index.value = next
  emit('update:step', next)
  void Promise.resolve().then(place)
}

function close(): void {
  state.setValue(false)
}

function finish(): void {
  close()
  emit('finish')
}

function next(): void {
  if (index.value >= steps.length - 1) finish()
  else setStep(index.value + 1)
}

watch(
  () => [state.value.value, step, steps.length] as const,
  () => {
    index.value = step
    void Promise.resolve().then(place)
  },
)

if (typeof window !== 'undefined') {
  window.addEventListener('resize', place)
  window.addEventListener('scroll', place, true)
}

onScopeDispose(() => {
  window.removeEventListener('resize', place)
  window.removeEventListener('scroll', place, true)
})
</script>

<template>
  <div v-if="state.value.value && current" class="ui-tour">
    <div class="ui-tour__mask" @click="close" />
    <div ref="hole" class="ui-tour__hole" />
    <div
      ref="card"
      class="ui-tour__card"
      role="dialog"
      aria-modal="true"
      :aria-label="current.title"
    >
      <slot :step="current" :index="index" :count="steps.length">
        <p>{{ index + 1 }} / {{ steps.length }}</p>
        <h2>{{ current.title }}</h2>
        <p>{{ current.description }}</p>
      </slot>
      <footer>
        <button type="button" @click="close">Skip</button>
        <button type="button" :disabled="index === 0" @click="setStep(index - 1)">Back</button>
        <button type="button" data-primary @click="next">
          {{ index >= steps.length - 1 ? 'Done' : 'Next' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-tour__mask {
  position: fixed;
  z-index: var(--ui-z-overlay);
  inset: 0;
}

.ui-tour__hole {
  position: fixed;
  z-index: calc(var(--ui-z-overlay) + 1);
  border-radius: var(--ui-radius-md);
  box-shadow: 0 0 0 9999px var(--ui-color-overlay);
  pointer-events: none;
}

.ui-tour__card {
  position: fixed;
  z-index: calc(var(--ui-z-dialog));
  width: min(20rem, calc(100vw - 1.5rem));
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);
}

h2,
p {
  margin: 0;
}

h2 {
  margin-top: var(--ui-space-1);
  font-size: var(--ui-font-size-md);
}

p {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-4);
}

button {
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-radius, 0.75rem);
  background: transparent;
  color: var(--ui-color-fg);
  cursor: pointer;

  &[data-primary] {
    border-color: var(--ui-color-accent);
  }

  &:disabled {
    opacity: 0.4;
  }
}
</style>
