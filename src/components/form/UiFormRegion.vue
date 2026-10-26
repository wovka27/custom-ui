<script setup lang="ts">
import { inject, useSlots, type FunctionalComponent } from 'vue'
import { formContextKey, formSlotsKey, type FormRegionSlotProps } from './context'
import type { FormAsyncState } from './schema'

const { name, state } = defineProps<{
  name: string
  state: FormAsyncState<unknown>
}>()

const form = inject(formContextKey)
const slots = inject(formSlotsKey, useSlots())
if (!form) throw new Error('UiFormRegion must be used inside UiForm.')

const Region: FunctionalComponent<FormRegionSlotProps> = (props) => {
  const render = slots[name]
  if (!render) return null
  return render(props)
}
Region.props = ['values', 'state']
</script>

<template>
  <region :values="form.values.value" :state="state" />
</template>
