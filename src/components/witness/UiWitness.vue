<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { witnessWhen, type WitnessMark } from './witness'

const {
  modelValue,
  defaultValue = null,
  statement,
  label = 'Witness',
  signedAt,
} = defineProps<{
  modelValue?: WitnessMark | null
  defaultValue?: WitnessMark | null
  statement: string
  label?: string
  signedAt?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WitnessMark | null]
}>()

defineSlots<{
  default(): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable<WitnessMark | null>({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const mark = computed(() => state.value.value)
const name = ref('')
const nameId = useId()

function sign(): void {
  const trimmed = name.value.trim()
  if (trimmed.length === 0 || mark.value) return
  state.setValue({ name: trimmed, at: signedAt ?? new Date().toISOString() })
}

function withdraw(): void {
  name.value = ''
  state.setValue(null)
}
</script>

<template>
  <section class="ui-witness" :aria-label="label">
    <p>
      <slot>{{ statement }}</slot>
    </p>
    <p v-if="mark" class="ui-witness__mark">
      Signed by {{ mark.name }} at {{ witnessWhen(mark.at) }}
      <button type="button" @click="withdraw">Withdraw</button>
    </p>
    <form v-else class="ui-witness__form" @submit.prevent="sign">
      <label :for="nameId">Name</label>
      <input :id="nameId" v-model="name" type="text" autocomplete="name" />
      <button type="submit" :disabled="name.trim().length === 0">Sign</button>
    </form>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-witness {
  @include surface;
  display: grid;
  gap: var(--ui-space-3);
  padding: var(--ui-space-4);
}

p {
  margin: 0;
}

.ui-witness__mark {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-witness__form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
}

label {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

input {
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-2);
  border: 1px solid var(--ui-control-border, var(--ui-color-border));
  border-radius: var(--ui-control-radius, var(--ui-radius-md));
  background: var(--ui-control-bg, var(--ui-color-surface));
  color: var(--ui-color-fg);
  font: inherit;
}

button {
  @include focus-ring(2px);
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-radius, var(--ui-radius-md));
  background: transparent;
  color: var(--ui-color-fg);
  font: inherit;
  cursor: pointer;
}

button:disabled {
  cursor: default;
  opacity: 0.4;
}
</style>
