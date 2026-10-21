<script setup lang="ts">
import { computed, inject, useSlots, watchEffect, type FunctionalComponent } from 'vue'
import { UiCheckbox } from '@/components/checkbox'
import { UiColorPicker } from '@/components/color-picker'
import { UiDatePicker, type UiDateRange } from '@/components/date-picker'
import { UiDateTimePicker } from '@/components/date-time-picker'
import { UiField } from '@/components/field'
import { UiInput } from '@/components/input'
import { UiInputOtp } from '@/components/input-otp'
import { UiInputTag } from '@/components/input-tag'
import { UiRadioGroup } from '@/components/radio-group'
import { UiSegmented } from '@/components/segmented'
import { UiSelect } from '@/components/select'
import { UiSlider } from '@/components/slider'
import { UiSwitch } from '@/components/switch'
import { UiTextarea } from '@/components/textarea'
import { UiUpload } from '@/components/upload'
import { warn } from '@/lib/warn'
import { formContextKey, formSlotsKey, type FieldSlotProps } from './context'
import UiFormTable from './UiFormTable.vue'
import {
  isDisabled,
  isFormQuery,
  isFormSpan,
  isOptionList,
  optionsKey,
  rowsKey,
  whenKey,
  type FormField,
  type FormValue,
} from './schema'

const { field } = defineProps<{
  field: FormField
}>()

const form = inject(formContextKey)
const slots = inject(formSlotsKey, useSlots())
if (!form) throw new Error('UiFormField must be used inside UiForm.')

const slotName = computed(() => `field-${field.name}`)
const hasCustom = computed(() => Boolean(slots[slotName.value]))
const bare = computed(() => hasCustom.value && field.chrome === 'bare')
const raw = computed(() => form.values.value[field.name] ?? null)
const controlDisabled = computed(() => form.disabled.value || isDisabled(field, form.values.value))
const controlSize = computed(() => field.size ?? form.size.value)
const optionState = computed(() => {
  if (field.kind !== 'select' || !isFormQuery(field.options)) return undefined
  return form.queries.value[optionsKey(field.name)]
})
const rowState = computed(() => {
  if (field.kind !== 'table' || !isFormQuery(field.rows)) return undefined
  return form.queries.value[rowsKey(field.name)]
})
const selectOptions = computed(() => {
  if (field.kind !== 'select' || isFormQuery(field.options)) {
    const data = optionState.value?.status === 'idle' ? undefined : optionState.value?.data
    return isOptionList(data) ? data : []
  }
  return field.options
})
const optionsPending = computed(() => optionState.value?.status === 'pending')
const rowsPending = computed(() => rowState.value?.status === 'pending')
const error = computed(() => {
  if (isFormQuery(field.when)) {
    const gate = form.queries.value[whenKey(field)]
    if (gate?.status === 'error') return gate.error.message
  }
  if (optionState.value?.status === 'error') return optionState.value.error.message
  if (rowState.value?.status === 'error') return rowState.value.error.message
  return form.errors.value[field.name]
})
const shownHint = computed(() => (optionsPending.value ? 'Loading options…' : field.hint))

watchEffect(() => {
  if (field.kind === 'custom' && !hasCustom.value) {
    warn('UiForm', `Custom field "${field.name}" expects a "${slotName.value}" slot.`)
  }
})

function assign(next: FormValue): void {
  form?.setValue(field.name, next)
}

function text(value: FormValue): string {
  return typeof value === 'string' ? value : ''
}

function checked(value: FormValue): boolean {
  return value === true
}

function choice(value: FormValue): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

function dateValue(value: FormValue, ranged: boolean): string | null | UiDateRange {
  if (!ranged) return typeof value === 'string' ? value : null
  if (!isFormSpan(value)) return { start: null, end: null }
  return {
    start: typeof value.start === 'string' ? value.start : null,
    end: typeof value.end === 'string' ? value.end : null,
  }
}

function sliderValue(
  value: FormValue,
  ranged: boolean,
  min: number,
  max: number,
): number | readonly [number, number] {
  if (!ranged) return typeof value === 'number' ? value : min
  if (isFormSpan(value) && typeof value.start === 'number' && typeof value.end === 'number') {
    return [value.start, value.end]
  }
  return [min, max]
}

function onSlider(value: number | readonly [number, number]): void {
  if (typeof value === 'number') {
    assign(value)
    return
  }
  const start = value[0]
  const end = value[1]
  if (typeof start !== 'number' || typeof end !== 'number') return
  assign({ start, end })
}

function tagsOf(value: FormValue): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function filesOf(value: FormValue): File[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is File => item instanceof File)
}

function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget
  const current = event.currentTarget
  if (!(current instanceof HTMLElement)) return
  if (next instanceof Node && current.contains(next)) return
  form?.touch(field.name)
}

const CustomSlot: FunctionalComponent<FieldSlotProps> = (props) => {
  const render = slots[slotName.value]
  if (!render) return null
  return render(props)
}
CustomSlot.props = ['value', 'error', 'disabled', 'setValue']
</script>

<template>
  <div :data-loading="optionsPending || rowsPending || undefined" @focusout="onFocusOut">
    <CustomSlot
      v-if="bare"
      :value="raw"
      :error="error"
      :disabled="controlDisabled"
      :set-value="assign"
    />
    <UiField
      v-else-if="hasCustom"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <CustomSlot :value="raw" :error="error" :disabled="controlDisabled" :set-value="assign" />
    </UiField>
    <UiField
      v-else-if="field.kind === 'text'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiInput
        :model-value="text(raw)"
        :type="field.type"
        :format="field.format"
        :locale="field.locale"
        :currency="field.currency"
        :fraction-digits="field.fractionDigits"
        :placeholder="field.placeholder"
        :autocomplete="field.autocomplete"
        :inputmode="field.inputmode"
        :revealable="field.revealable"
        :clearable="field.clearable"
        :readonly="field.readonly"
        :size="controlSize"
        :name="field.name"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'textarea'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiTextarea
        :model-value="text(raw)"
        :placeholder="field.placeholder"
        :rows="field.rows"
        :auto-size="field.autoSize"
        :readonly="field.readonly"
        :size="controlSize"
        :name="field.name"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'select'"
      :label="field.label"
      :hint="shownHint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled || optionsPending"
    >
      <UiSelect
        :model-value="choice(raw) ?? null"
        :options="selectOptions"
        :all-option="field.allOption"
        :placeholder="optionsPending && selectOptions.length === 0 ? 'Loading…' : field.placeholder"
        :size="controlSize"
        :name="field.name"
        :busy="optionsPending"
        :disabled="controlDisabled || optionsPending"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'radio'"
      :label="field.label"
      hide-label
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiRadioGroup
        :model-value="choice(raw)"
        :legend="field.label"
        :options="field.options"
        :name="field.name"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'checkbox'"
      :label="field.label"
      hide-label
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiCheckbox
        :model-value="checked(raw)"
        :size="controlSize"
        :name="field.name"
        :disabled="controlDisabled"
        @update:model-value="assign"
      >
        {{ field.label }}
        <span v-if="field.required" class="ui-form__mark" aria-hidden="true">*</span>
      </UiCheckbox>
    </UiField>
    <UiField
      v-else-if="field.kind === 'table'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiFormTable :field="field" :disabled="controlDisabled" />
    </UiField>
    <UiField
      v-else-if="field.kind === 'switch'"
      :label="field.label"
      hide-label
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiSwitch
        :model-value="checked(raw)"
        :size="controlSize"
        :disabled="controlDisabled"
        @update:model-value="assign"
      >
        {{ field.label }}
        <span v-if="field.required" class="ui-form__mark" aria-hidden="true">*</span>
      </UiSwitch>
    </UiField>
    <UiField
      v-else-if="field.kind === 'date' || field.kind === 'datetime'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <component
        :is="field.kind === 'datetime' ? UiDateTimePicker : UiDatePicker"
        :model-value="dateValue(raw, field.range === true)"
        :range="field.range === true"
        :min="field.min"
        :max="field.max"
        :placeholder="field.placeholder"
        :week-starts-on="field.weekStartsOn"
        :locale="field.locale"
        :name="field.name"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'slider'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiSlider
        :model-value="sliderValue(raw, field.range === true, field.min ?? 0, field.max ?? 100)"
        :range="field.range === true"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        :name="field.name"
        :label="field.label"
        :disabled="controlDisabled"
        @update:model-value="onSlider"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'color'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiColorPicker
        :model-value="text(raw) || undefined"
        :variant="field.variant"
        :swatches="field.swatches"
        :label="field.label"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'tags'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiInputTag
        :model-value="tagsOf(raw)"
        :placeholder="field.placeholder"
        :max="field.max"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'otp'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiInputOtp
        :model-value="text(raw)"
        :length="field.length"
        :type="field.type"
        :label="field.label"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'segmented'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiSegmented
        :model-value="choice(raw)"
        :options="field.options"
        :size="controlSize"
        :label="field.label"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
    <UiField
      v-else-if="field.kind === 'upload'"
      :label="field.label"
      :hint="field.hint"
      :error="error"
      :required="field.required"
      :disabled="controlDisabled"
    >
      <UiUpload
        :model-value="filesOf(raw)"
        :accept="field.accept"
        :multiple="field.multiple"
        :label="field.dropLabel ?? 'Upload files'"
        :disabled="controlDisabled"
        @update:model-value="assign"
      />
    </UiField>
  </div>
</template>

<style scoped lang="scss">
.ui-form__mark {
  margin-inline-start: 0.15rem;
  color: var(--ui-color-danger);
}
</style>
