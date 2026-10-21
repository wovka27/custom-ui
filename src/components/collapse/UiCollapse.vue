<script setup lang="ts">
import { provide } from 'vue'
import { useControllable } from '@/composables/use-controllable'
import { collapseKey } from './context'

const {
  modelValue,
  defaultValue = [],
  multiple = false,
} = defineProps<{
  modelValue?: readonly string[]
  defaultValue?: readonly string[]
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

defineSlots<{
  default(): unknown
}>()

const state = useControllable<readonly string[]>({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', [...next])
  },
})

function isOpen(name: string): boolean {
  return state.value.value.includes(name)
}

function toggle(name: string): void {
  const current = state.value.value
  if (current.includes(name)) {
    state.setValue(current.filter((item) => item !== name))
    return
  }
  state.setValue(multiple ? [...current, name] : [name])
}

provide(collapseKey, { isOpen, toggle })
</script>

<template>
  <div class="ui-collapse">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-collapse {
  display: grid;
  width: 100%;
  border-block: 1px solid var(--ui-color-border);
}
</style>
