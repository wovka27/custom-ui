<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import type { UiOption } from '@/types/common'

const {
  modelValue,
  defaultValue = '',
  options,
  label,
  placeholder,
  disabled = false,
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  options: readonly UiOption<string>[]
  label: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

defineSlots<{
  option(props: { option: UiOption<string>; active: boolean }): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const open = ref(false)
const active = ref(0)
const listId = useId()
const matches = computed(() => {
  const query = state.value.value.trim().toLocaleLowerCase()
  if (!query) return options
  return options.filter((option) => option.label.toLocaleLowerCase().includes(query))
})

function onInput(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  state.setValue(event.target.value)
  open.value = true
  active.value = 0
}

function choose(option: UiOption<string>): void {
  if (option.disabled) return
  state.setValue(option.label)
  open.value = false
}

function move(step: 1 | -1): void {
  if (matches.value.length === 0) return
  active.value = (active.value + step + matches.value.length) % matches.value.length
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Enter' && open.value) {
    const option = matches.value[active.value]
    if (!option) return
    event.preventDefault()
    choose(option)
  } else if (event.key === 'Escape') open.value = false
}
</script>

<template>
  <div class="ui-autocomplete">
    <input
      :value="state.value.value"
      type="text"
      role="combobox"
      :aria-label="label"
      :aria-expanded="open"
      :aria-controls="listId"
      aria-autocomplete="list"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @focus="open = true"
      @keydown="onKey"
      @blur="open = false"
    />
    <ul v-if="open" :id="listId" role="listbox">
      <li v-if="matches.length === 0" role="presentation">No matches</li>
      <li v-for="(option, index) in matches" :key="option.value" role="presentation">
        <button
          type="button"
          role="option"
          :aria-selected="index === active"
          :disabled="option.disabled"
          @mousedown.prevent="choose(option)"
        >
          <slot name="option" :option="option" :active="index === active">{{ option.label }}</slot>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-autocomplete {
  position: relative;
  width: 100%;
}

input {
  @include control-field;
  @include control-sizes;
}

ul {
  @include popup;
  position: absolute;
  z-index: var(--ui-z-dropdown);
  inset-inline: 0;
  top: calc(100% + 4px);
  display: grid;
  max-height: 12rem;
  margin: 0;
  padding: var(--ui-space-1);
  overflow: auto;
  list-style: none;
}

button {
  width: 100%;
  min-height: 2rem;
  padding-inline: var(--ui-space-2);
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: inherit;
  font-size: var(--ui-font-size-sm);
  text-align: start;
  cursor: pointer;

  @include focus-ring(1px);

  &[aria-selected='true'],
  &:hover {
    background: var(--ui-color-subtle);
  }
}
</style>
