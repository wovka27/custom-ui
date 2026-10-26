<script setup lang="ts">
import { useControllable, usePropWasPassed } from '@/composables/use-controllable'
import type { UiTone } from '@/types/common'
import { UiCloseButton } from '@/components/close'

const {
  label,
  selected,
  defaultSelected = false,
  disabled = false,
  removable = false,
  tone = 'neutral',
} = defineProps<{
  label?: string
  selected?: boolean
  defaultSelected?: boolean
  disabled?: boolean
  removable?: boolean
  tone?: UiTone
}>()

const emit = defineEmits<{
  'update:selected': [selected: boolean]
  remove: []
}>()

defineSlots<{
  default(): unknown
  leading(): unknown
}>()

const passed = usePropWasPassed('selected')
const state = useControllable({
  value: () => (passed() ? selected : undefined),
  defaultValue: () => defaultSelected,
  onChange: (next) => {
    emit('update:selected', next)
  },
})

function toggle(): void {
  if (disabled) return
  state.setValue(!state.value.value)
}
</script>

<template>
  <span class="ui-chip" :data-tone="tone" :data-selected="state.value.value ? 'true' : undefined">
    <button
      class="ui-chip__main"
      type="button"
      :aria-pressed="state.value.value"
      :disabled="disabled"
      @click="toggle"
    >
      <span v-if="$slots.leading" class="ui-chip__leading" aria-hidden="true"
        ><slot name="leading"
      /></span>
      <slot>{{ label }}</slot>
    </button>
    <ui-close-button v-if="removable" label="Remove" :disabled="disabled" @click="emit('remove')" />
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-chip {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);

  @include tone-ink;

  &[data-selected] {
    border-color: var(--ui-color-accent);
  }
}

.ui-chip__main {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  min-width: 0;
  height: 1.75rem;
  padding-inline: var(--ui-space-3);
  border: 0;
  border-radius: var(--ui-radius-full);
  background: transparent;
  color: inherit;
  font-size: var(--ui-font-size-xs);
  cursor: pointer;

  @include focus-ring(1px);
  @include truncate;

  &:disabled {
    cursor: not-allowed;
    color: var(--ui-color-muted);
  }
}

.ui-chip :deep(.ui-close) {
  margin-inline-end: 0.15rem;
}
</style>
