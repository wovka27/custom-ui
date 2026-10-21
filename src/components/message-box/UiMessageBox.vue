<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { messageBoxQueue, settleMessageBox } from './message-box'

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const draft = ref('')
const current = computed(() => messageBoxQueue.value[0])

watch(current, (request) => {
  draft.value = request?.defaultValue ?? ''
  void nextTick(() => {
    const dialog = dialogRef.value
    if (!dialog) return
    if (request && !dialog.open) dialog.showModal()
    if (!request && dialog.open) dialog.close()
  })
})

function confirm(): void {
  const request = current.value
  if (!request) return
  settleMessageBox(request.id, request.kind === 'prompt' ? draft.value : 'ok')
}

function cancel(): void {
  const request = current.value
  if (!request) return
  settleMessageBox(request.id, null)
}

function onCancel(event: Event): void {
  event.preventDefault()
  if (current.value?.kind === 'alert') confirm()
  else cancel()
}
</script>

<template>
  <dialog ref="dialog" class="ui-message-box" :data-tone="current?.tone" @cancel="onCancel">
    <template v-if="current">
      <h2>{{ current.title }}</h2>
      <p v-if="current.description">{{ current.description }}</p>
      <input
        v-if="current.kind === 'prompt'"
        v-model="draft"
        class="ui-message-box__input"
        type="text"
        @keydown.enter.prevent="confirm"
      />
      <footer>
        <button v-if="current.kind !== 'alert'" type="button" @click="cancel">
          {{ current.cancelLabel }}
        </button>
        <button type="button" data-primary @click="confirm">{{ current.confirmLabel }}</button>
      </footer>
    </template>
  </dialog>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-message-box {
  width: min(24rem, calc(100vw - 2rem));
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);

  &::backdrop {
    background: var(--ui-color-overlay);
  }
}

h2,
p {
  margin: 0;
}

p {
  margin-top: var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-4);
}

button {
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-radius, 0.75rem);
  background: transparent;
  color: var(--ui-color-fg);
  cursor: pointer;

  &[data-primary] {
    border-color: var(--ui-color-accent);
  }
}

.ui-message-box__input {
  @include control-field;
  margin-top: var(--ui-space-3);
}
</style>
