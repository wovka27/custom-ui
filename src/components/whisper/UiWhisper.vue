<script setup lang="ts">
import { ref, useId } from 'vue'

const { note } = defineProps<{
  note?: string
}>()

defineSlots<{
  default(): unknown
  note(): unknown
}>()

const open = ref(false)
const noteId = useId()
</script>

<template>
  <span class="ui-whisper">
    <button
      type="button"
      :aria-expanded="open"
      :aria-controls="open ? noteId : undefined"
      @click="open = !open"
    >
      <slot />
    </button>
    <span v-if="open" :id="noteId" class="ui-whisper__note" role="note">
      <slot name="note">{{ note }}</slot>
    </span>
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-whisper {
  display: inline;
}

button {
  @include focus-ring(2px);
  padding: 0;
  border: 0;
  border-bottom: 1px dashed var(--ui-color-accent);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.ui-whisper__note {
  display: block;
  margin-top: var(--ui-space-1);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}
</style>
