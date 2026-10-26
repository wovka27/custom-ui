<script setup lang="ts">
import { onScopeDispose, ref } from 'vue'

const { value, label = 'Copy' } = defineProps<{
  value: string
  label?: string
}>()

const emit = defineEmits<{
  copy: [value: string]
  error: []
}>()

defineSlots<{
  default(): unknown
  copied(): unknown
}>()

const copied = ref(false)
let timer = 0

onScopeDispose(() => {
  window.clearTimeout(timer)
})

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = true
    emit('copy', value)
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
    emit('error')
  }
}
</script>

<template>
  <span class="ui-copy">
    <button type="button" :aria-label="copied ? 'Copied' : label" @click="copy">
      <slot v-if="!copied" name="default">{{ label }}</slot>
      <slot v-else name="copied">Copied</slot>
    </button>
    <span class="ui-copy__live" aria-live="polite">{{ copied ? 'Copied' : '' }}</span>
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

button {
  @include surface;
  @include focus-ring(2px);
  @include pressable;
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-3);
  font-size: var(--ui-font-size-xs);
  cursor: pointer;
}

.ui-copy__live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
