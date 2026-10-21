import {
  computed,
  inject,
  toValue,
  useId,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from 'vue'

export interface FieldContext {
  fieldId: string
  describedBy: string | undefined
  errorId: string | undefined
  invalid: boolean
  disabled: boolean
  required: boolean
}

export const fieldContextKey: InjectionKey<ComputedRef<FieldContext>> = Symbol('UiFieldContext')

interface FieldControlSource {
  id: MaybeRefOrGetter<string | undefined>
  invalid: MaybeRefOrGetter<boolean | undefined>
  disabled: MaybeRefOrGetter<boolean | undefined>
  required: MaybeRefOrGetter<boolean | undefined>
}

interface FieldControl {
  controlId: ComputedRef<string>
  isInvalid: ComputedRef<boolean>
  isDisabled: ComputedRef<boolean>
  isRequired: ComputedRef<boolean>
  describedBy: ComputedRef<string | undefined>
  errorId: ComputedRef<string | undefined>
}

export function useFieldControl(source: FieldControlSource): FieldControl {
  const autoId = useId()
  const field = inject(fieldContextKey, null)

  const controlId = computed(() => toValue(source.id) ?? field?.value.fieldId ?? autoId)
  const isInvalid = computed(() => toValue(source.invalid) ?? field?.value.invalid ?? false)
  const isDisabled = computed(() => toValue(source.disabled) ?? field?.value.disabled ?? false)
  const isRequired = computed(() => toValue(source.required) ?? field?.value.required ?? false)
  const describedBy = computed(() => field?.value.describedBy)
  const errorId = computed(() => (isInvalid.value ? field?.value.errorId : undefined))

  return { controlId, isInvalid, isDisabled, isRequired, describedBy, errorId }
}
