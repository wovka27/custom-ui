<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiPopover } from '@/components/popover'
import { useControllable } from '@/composables/use-controllable'
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from './color'
import type { UiColorVariant } from './variant'
import ColorFields from './ColorFields.vue'

const {
  modelValue,
  defaultValue = '#5aa8ff',
  swatches = ['#111111', '#f4f4f4', '#5aa8ff', '#d4564e', '#3f9d6a', '#d2a04a'],
  variant = 'panel',
  disabled = false,
  label = 'Color',
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  swatches?: readonly string[]
  variant?: UiColorVariant
  disabled?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

defineSlots<{
  trigger(props: { color: string; open: boolean }): unknown
  swatch(props: { color: string; selected: boolean; choose: () => void }): unknown
}>()

const draft = ref('')
const state = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
})
const color = computed(() => normalizeHex(state.value.value) ?? '#5aa8ff')
const hsv = computed<Hsv>(() => hexToHsv(color.value) ?? { h: 210, s: 0.6, v: 1 })

function commit(next: string): void {
  const hex = normalizeHex(next)
  if (!hex) return
  state.setValue(hex)
}

function setHsv(next: Hsv): void {
  state.setValue(hsvToHex(next))
}

watch(
  color,
  (value) => {
    draft.value = value
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="variant === 'inline'" class="ui-color">
    <ColorFields
      :variant="variant"
      :hsv="hsv"
      :draft="draft"
      :swatches="swatches"
      :color="color"
      :disabled="disabled"
      @hsv="setHsv"
      @commit="commit"
      @update:draft="draft = $event"
    >
      <template v-if="$slots.swatch" #swatch="props">
        <slot name="swatch" v-bind="props" />
      </template>
    </ColorFields>
  </div>
  <UiPopover v-else class="ui-color" :padded="false">
    <template #trigger="{ open }">
      <slot name="trigger" :color="color" :open="open">
        <button
          class="ui-color__trigger"
          type="button"
          :disabled="disabled || undefined"
          :aria-label="label"
        >
          <span :style="{ background: color }" />
          <span>{{ color }}</span>
        </button>
      </slot>
    </template>
    <ColorFields
      :variant="variant"
      :hsv="hsv"
      :draft="draft"
      :swatches="swatches"
      :color="color"
      :disabled="disabled"
      @hsv="setHsv"
      @commit="commit"
      @update:draft="draft = $event"
    >
      <template v-if="$slots.swatch" #swatch="props">
        <slot name="swatch" v-bind="props" />
      </template>
    </ColorFields>
  </UiPopover>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-color__trigger {
  @include control-field;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  width: auto;
  cursor: pointer;

  span:first-child {
    width: 1rem;
    height: 1rem;
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius-sm);
  }
}

</style>
