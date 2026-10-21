<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { Key } from '@/a11y/keys'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'

const {
  modelValue,
  defaultValue = [],
  placeholder = 'Add a tag',
  disabled,
  invalid,
  id,
  max,
  separators = ',',
} = defineProps<{
  modelValue?: readonly string[]
  defaultValue?: readonly string[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  max?: number
  separators?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [value: string[]]
}>()

defineSlots<{
  tag(props: { tag: string; index: number; remove: () => void }): unknown
}>()

const draft = ref('')
const inputRef = useTemplateRef<HTMLInputElement>('input')
const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => false,
})
const state = useControllable<readonly string[]>({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    const value = [...next]
    emit('update:modelValue', value)
    emit('change', value)
  },
})

function pieces(raw: string): string[] {
  const marks = new Set([...separators, '\n'])
  const result: string[] = []
  let current = ''
  for (const char of raw) {
    if (!marks.has(char)) {
      current += char
      continue
    }
    if (current.trim().length > 0) result.push(current.trim())
    current = ''
  }
  if (current.trim().length > 0) result.push(current.trim())
  return result
}

function commit(raw: string): void {
  const parts = pieces(raw)
  if (parts.length === 0) return
  const next = [...state.value.value]
  for (const part of parts) {
    if (next.includes(part)) continue
    if (max !== undefined && next.length >= max) break
    next.push(part)
  }
  state.setValue(next)
  draft.value = ''
}

function removeAt(index: number): void {
  state.setValue(state.value.value.filter((_, itemIndex) => itemIndex !== index))
  inputRef.value?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === Key.Enter || separators.includes(event.key)) {
    event.preventDefault()
    commit(draft.value)
    return
  }
  if (event.key === Key.Backspace && draft.value.length === 0 && state.value.value.length > 0) {
    removeAt(state.value.value.length - 1)
  }
}

function onPaste(event: ClipboardEvent): void {
  const text = event.clipboardData?.getData('text') ?? ''
  if (!separators.split('').some((separator) => text.includes(separator)) && !text.includes('\n'))
    return
  event.preventDefault()
  commit(text)
}
</script>

<template>
  <div
    class="ui-tags"
    :data-disabled="field.isDisabled.value || undefined"
    @click="inputRef?.focus()"
  >
    <span v-for="(tag, index) in state.value.value" :key="`${tag}-${index}`" class="ui-tags__item">
      <slot name="tag" :tag="tag" :index="index" :remove="() => removeAt(index)">
        {{ tag }}
        <button
          type="button"
          :aria-label="`Remove ${tag}`"
          :disabled="field.isDisabled.value || undefined"
          @click.stop="removeAt(index)"
        >
          ×
        </button>
      </slot>
    </span>
    <input
      :id="field.controlId.value"
      ref="input"
      v-model="draft"
      :placeholder="state.value.value.length === 0 ? placeholder : ''"
      :disabled="field.isDisabled.value || undefined"
      :aria-invalid="field.isInvalid.value || undefined"
      @keydown="onKeydown"
      @paste="onPaste"
      @blur="commit(draft)"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-tags {
  @include control-field;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-1);
  height: auto;
  min-height: var(--_height, var(--ui-control-height-md));
  padding-block: var(--ui-space-1);
  cursor: text;

  &[data-disabled] {
    cursor: not-allowed;
  }
}

.ui-tags__item {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  max-width: 100%;
  padding: 0.1rem 0.35rem;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-subtle);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
}

button {
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;
}

input {
  flex: 1 1 6rem;
  min-width: 4rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: none;
}
</style>
