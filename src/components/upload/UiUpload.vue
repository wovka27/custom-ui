<script setup lang="ts">
import { onScopeDispose, ref, useTemplateRef } from 'vue'
import { useControllable } from '@/composables/use-controllable'

export interface UiUploadRequest {
  file: File
  signal: AbortSignal
  onProgress: (loaded: number, total: number) => void
}

interface UploadEntry {
  id: string
  file: File
  progress: number
  status: 'ready' | 'uploading' | 'success' | 'error'
  error: string
}

const {
  modelValue,
  defaultValue = [],
  accept,
  multiple = true,
  disabled = false,
  request,
  label = 'Upload files',
} = defineProps<{
  modelValue?: readonly File[]
  defaultValue?: readonly File[]
  accept?: string
  multiple?: boolean
  disabled?: boolean
  request?: (input: UiUploadRequest) => Promise<void>
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
}>()

defineSlots<{
  file(props: {
    file: File
    progress: number
    status: UploadEntry['status']
    error: string
    remove: () => void
  }): unknown
}>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const dragging = ref(false)
const entries = ref<UploadEntry[]>([])
const controllers = new Map<string, AbortController>()
const state = useControllable<readonly File[]>({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', [...next])
  },
})

function identity(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function publish(): void {
  state.setValue(entries.value.map((entry) => entry.file))
}

function remember(id: string, patch: Partial<UploadEntry>): void {
  entries.value = entries.value.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

function add(files: readonly File[]): void {
  const next = multiple ? files : files.slice(0, 1)
  if (!multiple) entries.value = []
  for (const file of next) {
    const id = identity(file)
    if (entries.value.some((entry) => entry.id === id)) continue
    const entry: UploadEntry = {
      id,
      file,
      progress: 0,
      status: request ? 'uploading' : 'success',
      error: '',
    }
    entries.value = [...entries.value, entry]
    if (!request) continue
    const controller = new AbortController()
    controllers.set(id, controller)
    const task = request({
      file,
      signal: controller.signal,
      onProgress: (loaded, total) => {
        const progress = total > 0 ? Math.min(1, loaded / total) : 0
        remember(id, { progress })
      },
    })
    void Promise.resolve(task)
      .then(() => {
        remember(id, { status: 'success', progress: 1 })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Upload failed'
        remember(id, { status: 'error', error: message })
      })
      .finally(() => {
        controllers.delete(id)
        publish()
      })
  }
  publish()
}

function onInput(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files) return
  void add([...target.files])
  target.value = ''
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  dragging.value = false
  if (disabled || !event.dataTransfer) return
  void add([...event.dataTransfer.files])
}

function remove(id: string): void {
  controllers.get(id)?.abort()
  controllers.delete(id)
  entries.value = entries.value.filter((entry) => entry.id !== id)
  publish()
}

onScopeDispose(() => {
  for (const controller of controllers.values()) controller.abort()
})
</script>

<template>
  <div class="ui-upload">
    <button
      class="ui-upload__drop"
      type="button"
      :data-dragging="dragging || undefined"
      :disabled="disabled || undefined"
      @click="inputRef?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop="onDrop"
    >
      {{ label }}
    </button>
    <input
      ref="input"
      class="ui-upload__input"
      type="file"
      :accept="accept"
      :multiple="multiple || undefined"
      :disabled="disabled || undefined"
      @change="onInput"
    />
    <ul v-if="entries.length > 0">
      <li v-for="entry in entries" :key="entry.id">
        <slot
          name="file"
          :file="entry.file"
          :progress="entry.progress"
          :status="entry.status"
          :error="entry.error"
          :remove="() => remove(entry.id)"
        >
          <span class="ui-upload__name">{{ entry.file.name }}</span>
          <span class="ui-upload__status">{{
            entry.status === 'uploading' ? `${Math.round(entry.progress * 100)}%` : entry.status
          }}</span>
          <button
            class="ui-upload__remove"
            type="button"
            :aria-label="`Remove ${entry.file.name}`"
            @click="remove(entry.id)"
          >
            ×
          </button>
        </slot>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.ui-upload {
  position: relative;
  display: grid;
  gap: var(--ui-space-2);
  width: 100%;
  min-width: 0;
}

.ui-upload__drop {
  padding: var(--ui-space-5);
  border: 1px dashed var(--ui-color-border-strong);
  border-radius: var(--ui-radius-md);
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;

  &[data-dragging] {
    border-color: var(--ui-color-accent);
    color: var(--ui-color-fg);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}

.ui-upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

ul {
  display: grid;
  gap: var(--ui-space-2);
  min-width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--ui-space-3);
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-font-size-sm);
}

.ui-upload__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-upload__status,
.ui-upload__remove {
  flex: none;
}

.ui-upload__remove {
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;
}
</style>
