<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'

const {
  src,
  alt,
  ratio,
  preview = false,
} = defineProps<{
  src?: string
  alt: string
  ratio?: number | string
  preview?: boolean
}>()

type ImageStatus =
  { status: 'empty' } | { status: 'pending' } | { status: 'loaded' } | { status: 'error' }

const status = ref<ImageStatus>({ status: 'empty' })
const open = ref(false)
const previewRef = useTemplateRef<HTMLDialogElement>('preview')

watch(
  () => src,
  (value) => {
    status.value = value ? { status: 'pending' } : { status: 'empty' }
    open.value = false
  },
  { immediate: true },
)

function onLoad(): void {
  status.value = { status: 'loaded' }
}

function onError(): void {
  status.value = { status: 'error' }
}

watch(open, (next) => {
  const dialog = previewRef.value
  if (!dialog) return
  if (next && !dialog.open) dialog.showModal()
  if (!next && dialog.open) dialog.close()
})
</script>

<template>
  <figure class="ui-image" :style="ratio ? { aspectRatio: String(ratio) } : undefined">
    <img
      v-if="src && status.status !== 'error'"
      :src="src"
      :alt="alt"
      :data-state="status.status"
      @load="onLoad"
      @error="onError"
      @click="preview && status.status === 'loaded' ? (open = true) : undefined"
    />
    <slot v-else name="fallback">
      <span class="ui-image__fallback">{{ alt }}</span>
    </slot>
    <dialog
      v-if="preview"
      ref="preview"
      class="ui-image__preview"
      @click="open = false"
      @cancel.prevent="open = false"
    >
      <img v-if="src && open" :src="src" :alt="alt" />
    </dialog>
  </figure>
</template>

<style scoped lang="scss">
.ui-image {
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-subtle);
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;

  &[data-state='pending'] {
    opacity: 0.4;
  }
}

.ui-image__fallback {
  display: grid;
  place-items: center;
  min-height: 6rem;
  padding: var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-image__preview {
  width: min(64rem, calc(100vw - 2rem));
  padding: 0;
  border: 0;
  background: transparent;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
}

.ui-image__preview::backdrop {
  background: var(--ui-color-overlay);
}
</style>
