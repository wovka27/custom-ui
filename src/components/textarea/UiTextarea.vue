<script setup lang="ts">
import { useAttrs } from 'vue'
import type { UiSize } from '@/types/common'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'
import { className, cn } from '@/lib/cn'

defineOptions({ inheritAttrs: false })

const {
  modelValue,
  defaultValue = '',
  size = 'md',
  id,
  name,
  disabled,
  invalid,
  required,
  readonly = false,
  placeholder,
  rows = 4,
  autoSize = false,
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  size?: UiSize
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  readonly?: boolean
  placeholder?: string
  rows?: number
  autoSize?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const attrs = useAttrs()
const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => required,
})
const state = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

function onInput(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLTextAreaElement)) return
  state.setValue(target.value)
}

function onChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLTextAreaElement)) return
  state.setValue(target.value)
  emit('change', target.value)
}
</script>

<template>
  <textarea
    v-bind="attrs"
    :id="field.controlId.value"
    :class="cn('ui-textarea', className(attrs.class))"
    :name="name"
    :rows="rows"
    :value="state.value.value"
    :placeholder="placeholder"
    :readonly="readonly || undefined"
    :disabled="field.isDisabled.value || undefined"
    :required="field.isRequired.value || undefined"
    :aria-invalid="field.isInvalid.value || undefined"
    :aria-describedby="field.describedBy.value"
    :aria-errormessage="field.errorId.value"
    :data-size="size"
    :data-autosize="autoSize || undefined"
    @input="onInput"
    @change="onChange"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-textarea {
  @include control-field;
  @include control-sizes;
  height: auto;
  min-height: 6.5rem;
  padding-block: var(--ui-space-2);
  resize: vertical;
  line-height: var(--ui-line-height);

  &[data-autosize='true'] {
    field-sizing: content;
    min-height: var(--_height);
    resize: none;
  }
}
</style>
