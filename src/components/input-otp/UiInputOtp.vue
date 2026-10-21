<script setup lang="ts">
import { computed, ref } from 'vue'
import { Key } from '@/a11y/keys'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'
import { otpValue, writeOtp } from './otp'

const {
  modelValue,
  defaultValue = '',
  length = 6,
  disabled,
  invalid,
  id,
  type = 'text',
  label = 'One-time code',
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  length?: number
  disabled?: boolean
  invalid?: boolean
  id?: string
  type?: 'text' | 'password'
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  complete: [value: string]
}>()

const inputs = ref<HTMLInputElement[]>([])

function setCell(element: unknown, index: number): void {
  if (element instanceof HTMLInputElement) inputs.value[index] = element
}
const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => false,
})
const state = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
    if (next.length === length) emit('complete', next)
  },
})
const chars = computed(() => {
  const value = state.value.value.slice(0, length).split('')
  while (value.length < length) value.push('')
  return value
})

function focusAt(index: number): void {
  if (index >= length) inputs.value?.[length - 1]?.blur()
  else inputs.value?.[index]?.focus()
}

function apply(index: number, raw: string): void {
  const next = writeOtp(chars.value, index, raw, length)
  state.setValue(otpValue(next.chars))
  focusAt(next.next)
}

function onInput(index: number, event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  apply(index, target.value)
  target.value = chars.value[index] ?? ''
}

function onKeydown(index: number, event: KeyboardEvent): void {
  if (event.key !== Key.Backspace && event.key !== Key.ArrowLeft && event.key !== Key.ArrowRight)
    return
  event.preventDefault()
  if (event.key === Key.ArrowLeft) {
    focusAt(Math.max(0, index - 1))
    return
  }
  if (event.key === Key.ArrowRight) {
    focusAt(Math.min(length - 1, index + 1))
    return
  }
  if ((chars.value[index] ?? '') !== '') {
    const next = chars.value.slice()
    next[index] = ''
    state.setValue(otpValue(next))
    return
  }
  focusAt(Math.max(0, index - 1))
}

function onPaste(index: number, event: ClipboardEvent): void {
  event.preventDefault()
  apply(index, event.clipboardData?.getData('text') ?? '')
}
</script>

<template>
  <div class="ui-otp" role="group" :aria-label="label">
    <input
      v-for="(char, index) in chars"
      :id="index === 0 ? field.controlId.value : undefined"
      :key="index"
      :ref="(element) => setCell(element, index)"
      class="ui-otp__cell"
      :type="type"
      inputmode="numeric"
      maxlength="1"
      autocomplete="one-time-code"
      :value="char"
      :disabled="field.isDisabled.value || undefined"
      :aria-invalid="field.isInvalid.value || undefined"
      :aria-label="`${label} ${index + 1}`"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste(index, $event)"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-otp {
  display: flex;
  gap: var(--ui-space-2);
}

.ui-otp__cell {
  @include control-field;
  width: 2.5rem;
  padding-inline: 0;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
