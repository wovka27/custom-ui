<script setup lang="ts">
import { computed, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useControllable } from '@/composables/use-controllable'

export interface UiUploadRequest {
  file: File
  signal: AbortSignal
  onProgress: (loaded: number, total: number) => void
}

export type UiUploadVariant = 'drop' | 'button' | 'picture' | 'gallery'

export type UiUploadShape = 'square' | 'circle'

interface UploadMeta {
  progress: number
  status: 'ready' | 'uploading' | 'success' | 'error'
  error: string
}

interface UploadEntry {
  id: string
  file: File
  progress: number
  status: UploadMeta['status']
  error: string
  preview: string | null
}

const {
  modelValue,
  defaultValue = [],
  variant = 'drop',
  shape = 'square',
  accept,
  multiple = true,
  disabled = false,
  request,
  label = 'Upload files',
  removeLabel = 'Remove',
} = defineProps<{
  modelValue?: readonly File[]
  defaultValue?: readonly File[]
  variant?: UiUploadVariant
  shape?: UiUploadShape
  accept?: string
  multiple?: boolean
  disabled?: boolean
  request?: (input: UiUploadRequest) => Promise<void>
  label?: string
  removeLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
}>()

defineSlots<{
  default(): unknown
  file(props: {
    file: File
    preview: string | null
    progress: number
    status: UploadMeta['status']
    error: string
    remove: () => void
  }): unknown
}>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const dragging = ref(false)
const previews = new Map<string, string>()
const meta = ref(new Map<string, UploadMeta>())
const controllers = new Map<string, AbortController>()
let depth = 0
const state = useControllable<readonly File[]>({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', [...next])
  },
})

const entries = computed((): UploadEntry[] => {
  return state.value.value.map((file) => {
    const id = identity(file)
    const item = meta.value.get(id)
    return {
      id,
      file,
      progress: item?.progress ?? 1,
      status: item?.status ?? 'success',
      error: item?.error ?? '',
      preview: previewOf(file, id),
    }
  })
})
const single = computed(() => variant === 'picture' || !multiple)
const cover = computed(() => entries.value[0] ?? null)
const listed = computed(() => variant === 'drop' || variant === 'button')

watch(
  () => state.value.value.map((file) => identity(file)).join('|'),
  () => {
    const live = new Set(state.value.value.map((file) => identity(file)))
    const next = new Map(meta.value)
    for (const id of meta.value.keys()) {
      if (live.has(id)) continue
      const url = previews.get(id)
      if (url) URL.revokeObjectURL(url)
      previews.delete(id)
      next.delete(id)
      controllers.get(id)?.abort()
      controllers.delete(id)
    }
    if (next.size !== meta.value.size) meta.value = next
  },
)

function identity(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function previewOf(file: File, id: string): string | null {
  if (!file.type.startsWith('image/')) return null
  const existing = previews.get(id)
  if (existing) return existing
  const url = URL.createObjectURL(file)
  previews.set(id, url)
  return url
}

function publish(files: readonly File[]): void {
  state.setValue([...files])
}

function remember(id: string, patch: Partial<UploadMeta>): void {
  const next = new Map(meta.value)
  const current = next.get(id) ?? { progress: 0, status: 'ready', error: '' }
  next.set(id, { ...current, ...patch })
  meta.value = next
}

function start(file: File, id: string): void {
  if (!request) return
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
    })
}

function add(files: readonly File[]): void {
  if (disabled) return
  const incoming = single.value ? files.slice(0, 1) : files
  const current = single.value ? [] : [...state.value.value]
  const seen = new Set(current.map((file) => identity(file)))
  const next = [...current]
  for (const file of incoming) {
    const id = identity(file)
    if (seen.has(id)) continue
    seen.add(id)
    next.push(file)
    remember(id, {
      progress: 0,
      status: request ? 'uploading' : 'success',
      error: '',
    })
    start(file, id)
  }
  publish(next)
}

function open(): void {
  if (disabled) return
  inputRef.value?.click()
}

function onInput(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement) || !target.files) return
  add([...target.files])
  target.value = ''
}

function onDragEnter(): void {
  if (disabled) return
  depth += 1
  dragging.value = true
}

function onDragLeave(): void {
  depth = Math.max(0, depth - 1)
  if (depth === 0) dragging.value = false
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  depth = 0
  dragging.value = false
  if (disabled || !event.dataTransfer) return
  add([...event.dataTransfer.files])
}

function remove(id: string): void {
  publish(state.value.value.filter((file) => identity(file) !== id))
}

function percent(entry: UploadEntry): string {
  return `${Math.round(entry.progress * 100)}%`
}

function meter(entry: UploadEntry): Record<string, string> {
  return { '--_progress': String(entry.progress) }
}

function removeName(file: File): string {
  return `${removeLabel} ${file.name}`
}

onScopeDispose(() => {
  for (const controller of controllers.values()) controller.abort()
  for (const url of previews.values()) URL.revokeObjectURL(url)
  previews.clear()
})
</script>

<template>
  <div
    class="ui-upload"
    :data-variant="variant"
    :data-shape="variant === 'picture' ? shape : undefined"
    :data-dragging="dragging || undefined"
    :data-disabled="disabled || undefined"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      ref="input"
      class="ui-upload__input"
      type="file"
      aria-hidden="true"
      tabindex="-1"
      :accept="accept"
      :multiple="single ? undefined : true"
      :disabled="disabled || undefined"
      @change="onInput"
    />

    <div v-if="variant === 'picture'" class="ui-upload__frame">
      <button
        class="ui-upload__trigger"
        type="button"
        :disabled="disabled || undefined"
        :data-filled="cover ? true : undefined"
        :data-status="cover?.status"
        @click="open"
      >
        <img v-if="cover?.preview" :src="cover.preview" :alt="cover.file.name" />
        <span v-else-if="cover" class="ui-upload__prompt">{{ cover.file.name }}</span>
        <span v-else class="ui-upload__prompt"
          ><slot>{{ label }}</slot></span
        >
        <span v-if="cover?.status === 'uploading'" class="ui-upload__meter" :style="meter(cover)" />
        <span v-if="cover?.status === 'uploading'" class="ui-upload__percent">{{
          percent(cover)
        }}</span>
      </button>
      <button
        v-if="cover"
        class="ui-upload__remove"
        type="button"
        :aria-label="removeName(cover.file)"
        :disabled="disabled || undefined"
        @click="remove(cover.id)"
      >
        ×
      </button>
      <p v-if="cover?.status === 'error'" class="ui-upload__error">{{ cover.error }}</p>
    </div>

    <ul v-else-if="variant === 'gallery'" class="ui-upload__grid">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="ui-upload__tile"
        :data-status="entry.status"
      >
        <slot
          name="file"
          :file="entry.file"
          :preview="entry.preview"
          :progress="entry.progress"
          :status="entry.status"
          :error="entry.error"
          :remove="() => remove(entry.id)"
        >
          <img v-if="entry.preview" :src="entry.preview" :alt="entry.file.name" />
          <span v-else class="ui-upload__prompt">{{ entry.file.name }}</span>
          <span
            v-if="entry.status === 'uploading'"
            class="ui-upload__meter"
            :style="meter(entry)"
          />
          <span v-if="entry.status === 'uploading'" class="ui-upload__percent">{{
            percent(entry)
          }}</span>
          <button
            class="ui-upload__remove"
            type="button"
            :aria-label="removeName(entry.file)"
            :disabled="disabled || undefined"
            @click="remove(entry.id)"
          >
            ×
          </button>
        </slot>
      </li>
      <li>
        <button
          class="ui-upload__add"
          type="button"
          :disabled="disabled || undefined"
          @click="open"
        >
          <slot>{{ label }}</slot>
        </button>
      </li>
    </ul>

    <template v-else>
      <button
        class="ui-upload__trigger"
        type="button"
        :disabled="disabled || undefined"
        @click="open"
      >
        <slot>{{ label }}</slot>
      </button>
      <ul v-if="listed && entries.length > 0" class="ui-upload__list">
        <li v-for="entry in entries" :key="entry.id" :data-status="entry.status">
          <slot
            name="file"
            :file="entry.file"
            :preview="entry.preview"
            :progress="entry.progress"
            :status="entry.status"
            :error="entry.error"
            :remove="() => remove(entry.id)"
          >
            <img
              v-if="entry.preview"
              class="ui-upload__thumb"
              :src="entry.preview"
              :alt="entry.file.name"
            />
            <span class="ui-upload__name">{{ entry.file.name }}</span>
            <span v-if="entry.status === 'uploading'" class="ui-upload__status">{{
              percent(entry)
            }}</span>
            <span v-else-if="entry.status === 'error'" class="ui-upload__error">{{
              entry.error
            }}</span>
            <button
              class="ui-upload__remove"
              type="button"
              :aria-label="removeName(entry.file)"
              :disabled="disabled || undefined"
              @click="remove(entry.id)"
            >
              ×
            </button>
          </slot>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-upload {
  position: relative;
  display: grid;
  gap: var(--ui-space-2);
  width: 100%;
  min-width: 0;

  &[data-disabled='true'] {
    opacity: 0.55;
  }
}

.ui-upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.ui-upload__trigger,
.ui-upload__add {
  @include focus-ring;
  border: 1px dashed var(--ui-color-border-strong);
  border-radius: var(--ui-radius-md);
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.ui-upload[data-variant='drop'] .ui-upload__trigger {
  padding: var(--ui-space-5);
}

.ui-upload[data-variant='button'] .ui-upload__trigger {
  justify-self: start;
  padding: var(--ui-space-2) var(--ui-space-3);
  border-style: solid;
  border-color: var(--ui-color-border);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
}

.ui-upload[data-dragging] .ui-upload__trigger,
.ui-upload[data-dragging] .ui-upload__add {
  border-color: var(--ui-color-accent);
  color: var(--ui-color-fg);
}

.ui-upload__frame {
  position: relative;
  width: min(100%, 16rem);
}

.ui-upload[data-variant='picture'] .ui-upload__trigger {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ui-upload[data-variant='picture'][data-shape='circle'] {
  .ui-upload__frame {
    width: 7.5rem;
  }

  .ui-upload__trigger {
    aspect-ratio: 1;
    border-radius: 999px;
  }
}

.ui-upload__frame .ui-upload__remove {
  position: absolute;
  inset-block-start: var(--ui-space-2);
  inset-inline-end: var(--ui-space-2);
  background: var(--ui-color-bg);
}

.ui-upload__prompt {
  max-width: 100%;
  padding: var(--ui-space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-upload__list,
.ui-upload__grid {
  display: grid;
  gap: var(--ui-space-2);
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-upload__list li {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--ui-space-3);
  padding: var(--ui-space-2);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-font-size-sm);

  &[data-status='error'] {
    border-color: var(--ui-color-danger);
  }
}

.ui-upload__thumb {
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  object-fit: cover;
  border-radius: var(--ui-radius-sm);
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
  @include focus-ring;
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;
}

.ui-upload__error {
  margin: 0;
  color: var(--ui-color-danger);
  font-size: var(--ui-font-size-xs);
}

.ui-upload__grid {
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
}

.ui-upload__tile,
.ui-upload__add {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.ui-upload__tile {
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);

  &[data-status='error'] {
    border-color: var(--ui-color-danger);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ui-upload__tile .ui-upload__remove {
  position: absolute;
  inset-block-start: var(--ui-space-1);
  inset-inline-end: var(--ui-space-1);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-bg);
}

.ui-upload__add {
  padding: var(--ui-space-2);
}

.ui-upload__meter {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  height: 2px;
  background: var(--ui-color-accent);
  transform: scaleX(var(--_progress, 0));
  transform-origin: left center;
}

.ui-upload__percent {
  position: absolute;
  inset-inline-end: var(--ui-space-2);
  inset-block-end: var(--ui-space-2);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
}

.ui-upload__trigger,
.ui-upload__tile {
  position: relative;
}
</style>
