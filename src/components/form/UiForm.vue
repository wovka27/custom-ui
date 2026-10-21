<script setup lang="ts">
import { computed, provide, useId, useSlots, useTemplateRef, watch } from 'vue'
import type { UiGap, UiSize } from '@/types/common'
import { UiAlert } from '@/components/alert'
import { UiButton } from '@/components/button'
import { UiCluster, UiStack } from '@/components/layout'
import { formContextKey, formSlotsKey, type FormApi, type FormRegionSlotProps } from './context'
import { sameFormValues, type FormNode, type FormValidateOn, type FormValues } from './schema'
import { useForm } from './use-form'
import UiFormNodes from './UiFormNodes.vue'

const {
  schema,
  modelValue,
  initial,
  onSubmit,
  validateOn = 'submit',
  submitLabel = 'Save',
  resetLabel = 'Reset',
  showReset = false,
  successLabel,
  disabled = false,
  gap = 'md',
  columns = '18rem',
  size,
  label,
  as = 'form',
} = defineProps<{
  schema: readonly FormNode[]
  modelValue?: FormValues
  initial?: FormValues
  onSubmit?: (values: FormValues) => void | Promise<void>
  validateOn?: FormValidateOn
  submitLabel?: string
  resetLabel?: string
  showReset?: boolean
  successLabel?: string
  disabled?: boolean
  gap?: UiGap
  columns?: string
  size?: UiSize
  label?: string
  as?: 'form' | 'region'
}>()

const emit = defineEmits<{
  submit: [values: FormValues]
  invalid: [errors: Readonly<Partial<Record<string, string>>>]
  'update:modelValue': [values: FormValues]
  reset: []
}>()

defineSlots<{
  header?(): unknown
  footer?(): unknown
  actions?(props: { submitting: boolean }): unknown
  [name: `field-${string}`]: (props: {
    value: FormValues[string]
    error: string | undefined
    disabled: boolean
    setValue: (value: FormValues[string]) => unknown
  }) => unknown
  [name: `block-${string}`]: (props: FormRegionSlotProps) => unknown
  [name: `section-${string}`]: (props: FormRegionSlotProps) => unknown
}>()

const formId = useId()
const titleId = useId()
const rootRef = useTemplateRef<HTMLElement>('root')
const form = useForm({
  schema: () => schema,
  initial: () => initial,
  modelValue: () => modelValue,
  validateOn: () => validateOn,
  onSubmit: async (values) => {
    await onSubmit?.(values)
    emit('submit', values)
  },
  onInvalid: (errors) => {
    emit('invalid', errors)
  },
})

const region = computed(() => as === 'region')
const submitting = computed(() => form.status.value.status === 'submitting')
const errorMessage = computed(() =>
  form.status.value.status === 'error' ? form.status.value.message : undefined,
)
const succeeded = computed(() => form.status.value.status === 'success')

const api: FormApi = {
  values: form.values,
  errors: form.errors,
  queries: form.queries,
  status: form.status,
  disabled: computed(() => disabled || submitting.value),
  size: computed(() => size),
  setValue: form.setValue,
  setError: form.setError,
  touch: form.touch,
  submit: form.submit,
  reset: () => {
    form.reset()
    emit('reset')
  },
}

provide(formContextKey, api)
provide(formSlotsKey, useSlots())

watch(form.values, (next) => {
  if (modelValue && same(modelValue, next)) return
  emit('update:modelValue', { ...next })
})

function same(left: FormValues, right: FormValues): boolean {
  return sameFormValues(left, right)
}

async function submitForm(event: Event): Promise<void> {
  event.preventDefault()
  await form.submit()
  if (form.status.value.status !== 'invalid') return
  const first = Object.keys(form.errors.value)[0]
  const root = rootRef.value
  if (!first || !root) return
  const scope = root.querySelector(`[data-field="${globalThis.CSS.escape(first)}"]`)
  if (!(scope instanceof HTMLElement)) return
  const target = scope.querySelector('input, textarea, select, button, [tabindex]')
  if (target instanceof HTMLElement) target.focus()
}

function onNativeSubmit(event: Event): void {
  if (region.value) return
  void submitForm(event)
}

function onRegionSubmit(event: MouseEvent): void {
  if (!region.value) return
  void submitForm(event)
}

defineExpose({
  submit: form.submit,
  reset: api.reset,
  validate: form.validate,
  validateAsync: form.validateAsync,
  setValue: form.setValue,
  setError: form.setError,
  setErrors: form.setErrors,
})
</script>

<template>
  <component
    :is="region ? 'div' : 'form'"
    :id="formId"
    ref="root"
    class="ui-form"
    :role="region ? 'group' : undefined"
    :aria-labelledby="label ? titleId : undefined"
    :novalidate="region ? undefined : true"
    @submit="onNativeSubmit"
  >
    <UiStack :gap="gap">
      <header v-if="label || $slots.header">
        <h2 v-if="label" :id="titleId" class="ui-form__title">{{ label }}</h2>
        <slot name="header" />
      </header>
      <UiAlert
        v-if="errorMessage"
        class="ui-reveal"
        tone="danger"
        title="Could not save"
        :description="errorMessage"
      />
      <p v-else-if="succeeded && successLabel" class="ui-form__status ui-reveal" role="status">
        {{ successLabel }}
      </p>
      <UiFormNodes :nodes="schema" :columns="columns" :gap="gap" />
      <slot name="actions" :submitting="submitting">
        <UiCluster justify="end">
          <UiButton
            v-if="showReset"
            type="button"
            variant="secondary"
            :disabled="disabled || submitting"
            @click="api.reset()"
          >
            {{ resetLabel }}
          </UiButton>
          <UiButton
            :type="region ? 'button' : 'submit'"
            :loading="submitting"
            :disabled="disabled"
            @click="onRegionSubmit"
          >
            {{ submitLabel }}
          </UiButton>
        </UiCluster>
      </slot>
      <slot name="footer" />
    </UiStack>
  </component>
</template>

<style scoped lang="scss">
.ui-form {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.ui-form__title {
  margin: 0;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-lg);
  font-weight: 560;
  letter-spacing: -0.03em;
}

.ui-form__status {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}
</style>
