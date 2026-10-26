<script setup lang="ts">
import { onMounted, onScopeDispose, ref, useId, useTemplateRef, watch } from 'vue'
import { useCarriedTokens } from '@/composables/use-carried-tokens'
import { UiCloseButton } from '@/components/close'
import {
  activateDialog,
  cancelDialogClose,
  releaseDialog,
  requestDialogClose,
  type DialogCloseGuard,
} from '@/components/dialog/dialog-stack'

const {
  open = false,
  title,
  description,
  side = 'end',
  persistent = false,
  beforeClose,
} = defineProps<{
  open?: boolean
  title: string
  description?: string
  side?: 'start' | 'end' | 'bottom'
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
  <span ref="anchor" class="ui-drawer__anchor" aria-hidden="true" />
  <teleport to="body">
    <dialog
      ref="dialog"
      class="ui-drawer"
      :style="carried"
      :data-side="side"
      :data-closing="closing ? 'true' : undefined"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @close="onClose"
      @cancel="onCancel"
      @click="onBackdrop"
    >
      <header>
        <div>
          <h2 :id="titleId">{{ title }}</h2>
          <p v-if="description" :id="descriptionId">{{ description }}</p>
        </div>
        <ui-close-button
          v-if="!persistent"
          label="Close drawer"
          :disabled="closing"
          @click="askClose"
        />
      </header>
      <div class="ui-drawer__body"><slot /></div>
      <footer v-if="$slots.footer">
        <slot name="footer" :close="askClose" :closing="closing" />
      </footer>
    </dialog>
  </teleport>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-drawer__anchor {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.ui-drawer {
  box-sizing: border-box;

  :deep(*) {
    box-sizing: border-box;
  }

  @include popup;
  font-family: var(--ui-font-sans);
  font-size: var(--ui-font-size-md);
  line-height: var(--ui-line-height);
  width: min(24rem, 100vw);
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: auto;

  &[data-side='end'] {
    position: fixed;
    inset: 0 0 0 auto;
  }

  &[data-side='start'] {
    position: fixed;
    inset: 0 auto 0 0;
  }

  &[data-side='bottom'] {
    position: fixed;
    inset: auto 0 0 0;
    width: 100vw;
    height: auto;
    max-height: min(70dvh, 36rem);
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  &::backdrop {
    background: var(--ui-color-overlay);
  }
}

header,
footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-4);
}

header {
  border-bottom: 1px solid var(--ui-color-border);
}

footer {
  border-top: 1px solid var(--ui-color-border);
}

h2,
p {
  margin: 0;
}

h2 {
  font-size: var(--ui-font-size-md);
}

p {
  margin-top: var(--ui-space-1);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-drawer__body {
  padding: var(--ui-space-4);
  font-size: var(--ui-font-size-sm);
}
</style>
