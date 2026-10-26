<script setup lang="ts">
const { label, disabled = false } = defineProps<{
  label: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="ui-close"
    type="button"
    :aria-label="label"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
  </button>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-close {
  @include icon-control;
}
</style>
