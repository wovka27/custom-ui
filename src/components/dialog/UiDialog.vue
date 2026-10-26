<script setup lang="ts">
import { onMounted, onScopeDispose, ref, useId, useTemplateRef, watch } from 'vue'
import { useCarriedTokens } from '@/composables/use-carried-tokens'
import type { UiSize } from '@/types/common'
import {
  activateDialog,
  cancelDialogClose,
  releaseDialog,
  requestDialogClose,
  type DialogCloseGuard,
} from './dialog-stack'

const {
  open = false,
  title,
  description,
  size = 'md',
  persistent = false,
  beforeClose,
} = defineProps<{
  open?: boolean
  title: string
  description?: string
  size?: UiSize
  persistent?: boolean
  beforeClose?: DialogCloseGuard
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

defineSlots<{
  default(): unknown
  footer(props: { close: () => void; closing: boolean }): unknown
}>()

const titleId = useId()
const descriptionId = useId()
const layerId = useId()
const anchorRef = useTemplateRef<HTMLElement>('anchor')
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const carried = useCarriedTokens(anchorRef)
const closing = ref(false)
let closeTicket = 0

function askClose(): void {
  if (persistent || closing.value) return
  emit('update:open', false)
}

function sync(isOpen: boolean): void {
  const dialog = dialogRef.value
  if (!dialog) return
  if (isOpen && !dialog.open) dialog.showModal()
  if (!isOpen && dialog.open) dialog.close()
}

onMounted(() => {
  if (!open) return
  activateDialog(layerId)
  sync(true)
})

watch(
  () => open,
  (isOpen, _previous, onCleanup) => {
    const ticket = ++closeTicket
    let current = true
    onCleanup(() => {
      current = false
    })
    if (isOpen) {
      cancelDialogClose(layerId)
      activateDialog(layerId)
      closing.value = false
      sync(true)
      return
    }
    void (async () => {
      closing.value = true
      const allowed = await requestDialogClose(layerId, () => beforeClose?.() ?? true)
      if (!current || ticket !== closeTicket) return
      closing.value = false
      if (!allowed) {
        if (!open) emit('update:open', true)
        return
      }
      if (open) return
      sync(false)
    })()
  },
)

onScopeDispose(() => {
  releaseDialog(layerId)
})

function onClose(): void {
  if (open) emit('update:open', false)
}

function onCancel(event: Event): void {
  event.preventDefault()
  askClose()
}

function onBackdrop(event: MouseEvent): void {
  if (event.target !== dialogRef.value) return
  askClose()
}
</script>

<template>
  <span ref="anchor" class="ui-dialog__anchor" aria-hidden="true" />
  <teleport to="body">
    <dialog
      ref="dialog"
      class="ui-dialog"
      :style="carried"
      :data-size="size"
      :data-closing="closing ? 'true' : undefined"
      aria-modal="true"
      :aria-busy="closing ? 'true' : undefined"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @close="onClose"
      @cancel="onCancel"
      @click="onBackdrop"
    >
      <header class="ui-dialog__header">
        <div class="ui-dialog__heading">
          <h2 :id="titleId">{{ title }}</h2>
          <p v-if="description" :id="descriptionId">{{ description }}</p>
        </div>
        <button
          v-if="!persistent"
          class="ui-dialog__close"
          type="button"
          aria-label="Close dialog"
          :disabled="closing"
          @click="askClose"
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
      </header>
      <div class="ui-dialog__body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="ui-dialog__footer">
        <slot name="footer" :close="askClose" :closing="closing" />
      </footer>
    </dialog>
  </teleport>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-dialog__anchor {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.ui-dialog {
  box-sizing: border-box;

  :deep(*) {
    box-sizing: border-box;
  }

  width: min(calc(100vw - 2rem), var(--_width, 32rem));
  max-height: min(40rem, calc(100dvh - 2rem));
  padding: 0;
  overflow: auto;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-font-size-md);
  line-height: var(--ui-line-height);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);
  opacity: 0;
  transition:
    opacity var(--ui-duration-reveal) var(--ui-ease),
    overlay var(--ui-duration-reveal) allow-discrete,
    display var(--ui-duration-reveal) allow-discrete;

  &[open] {
    opacity: 1;
  }

  &[data-size='sm'] {
    --_width: 24rem;
  }
  &[data-size='md'] {
    --_width: 32rem;
  }
  &[data-size='lg'] {
    --_width: 48rem;
  }

  &::backdrop {
    background: var(--ui-color-overlay);
    opacity: 0;
    transition:
      opacity var(--ui-duration-reveal) var(--ui-ease),
      overlay var(--ui-duration-reveal) allow-discrete,
      display var(--ui-duration-reveal) allow-discrete;
  }

  &[open]::backdrop {
    opacity: 1;
  }
}

@starting-style {
  .ui-dialog[open],
  .ui-dialog[open]::backdrop {
    opacity: 0;
  }
}

.ui-dialog__header,
.ui-dialog__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-4) var(--ui-space-5);
}

.ui-dialog__header {
  border-bottom: 1px solid var(--ui-color-border);
}

.ui-dialog__footer {
  justify-content: flex-end;
  border-top: 1px solid var(--ui-color-border);
}

.ui-dialog__heading {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  min-width: 0;

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: var(--ui-font-size-lg);
    line-height: 1.3;
  }

  p {
    color: var(--ui-color-muted);
    font-size: var(--ui-font-size-sm);
  }
}

.ui-dialog__body {
  padding: var(--ui-space-5);
}

.ui-dialog__close {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  cursor: pointer;
  transition:
    background-color var(--ui-duration) var(--ui-ease),
    border-color var(--ui-duration) var(--ui-ease),
    color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  @include focus-ring(1px);

  &:hover:not(:disabled) {
    border-color: var(--ui-color-border-strong);
    background: var(--ui-color-subtle);
  }

  &:active:not(:disabled) {
    transform: scale(var(--ui-press-scale));
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
