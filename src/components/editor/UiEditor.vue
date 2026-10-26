<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, useTemplateRef } from 'vue'
import { UiButton } from '@/components/button'
import { UiDialog } from '@/components/dialog'
import { defineForm, UiForm, type FormValues } from '@/components/form'
import { UiInput } from '@/components/input'
import { UiPopover } from '@/components/popover'
import { UiSelect } from '@/components/select'
import { UiToolbar } from '@/components/toolbar'
import { useControllable } from '@/composables/use-controllable'
import type { UiOption } from '@/types/common'
import {
  blockShortcut,
  blockText,
  canonMarks,
  clearFormatting,
  cloneDocument,
  countWords,
  deleteRange,
  documentText,
  editText,
  editorAsset,
  editorHref,
  editorMarks,
  emptyBlock,
  emptyDocument,
  findBlock,
  imageBlock,
  insertAfter,
  isEditorBlockKind,
  mapSelection,
  marksAt,
  mergeWith,
  moveBlock,
  orderRange,
  pasteText,
  placeBlock,
  rangeHasMark,
  rangeHref,
  reconcileText,
  sameDocument,
  selectedText,
  setBlockAlign,
  setBlockKind,
  setChecked,
  setLink,
  shiftOffset,
  splitAt,
  toggleMark,
  updateBlock,
  type EditorAlign,
  type EditorBlock,
  type EditorBlockKind,
  type EditorDocument,
  type EditorMark,
  type EditorPoint,
  type EditorStyle,
} from './document'
import { editorEmojiGroups } from './emoji'
import type { EditorEmojiGroupId } from './emoji'
import { defaultEditorLabels, type EditorLabels } from './labels'

const {
  modelValue,
  defaultValue,
  label,
  placeholder,
  labels,
  readonly = false,
  disabled = false,
  spellcheck = true,
} = defineProps<{
  modelValue?: EditorDocument
  defaultValue?: EditorDocument
  label?: string
  placeholder?: string
  labels?: Partial<EditorLabels>
  readonly?: boolean
  disabled?: boolean
  spellcheck?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EditorDocument]
  change: [value: EditorDocument]
}>()

defineSlots<{
  toolbar?(props: {
    labels: EditorLabels
    marks: readonly EditorMark[]
    kind: string
    disabled: boolean
    canUndo: boolean
    canRedo: boolean
    command: EditorCommand
  }): unknown
  status?(props: { words: number; characters: number }): unknown
}>()

interface EditorRange {
  start: EditorPoint
  end: EditorPoint
}

interface EditorCommand {
  toggle: (mark: EditorMark) => void
  kind: (value: string) => void
  link: () => void
  unlink: () => void
  clear: () => void
  undo: () => void
  redo: () => void
  move: (direction: -1 | 1) => void
  align: (value: EditorAlign) => void
  emoji: (glyph: string) => void
  image: () => void
  divider: () => void
}

const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const imageBytes = 1_500_000

const markItems = [
  { mark: 'bold', glyph: 'B' },
  { mark: 'italic', glyph: 'I' },
  { mark: 'underline', glyph: 'U' },
  { mark: 'strike', glyph: 'S' },
  { mark: 'code', glyph: '</>' },
  { mark: 'highlight', glyph: 'H' },
  { mark: 'sub', glyph: '₂' },
  { mark: 'sup', glyph: '²' },
] as const satisfies readonly { mark: EditorMark; glyph: string }[]

const alignItems = [
  { align: 'start', glyph: '⇤' },
  { align: 'center', glyph: '≡' },
  { align: 'end', glyph: '⇥' },
] as const satisfies readonly { align: EditorAlign; glyph: string }[]

const seed = useId()
let serial = 0
const documentState = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue ?? emptyDocument(nextId()),
  onChange(next) {
    emit('update:modelValue', next)
    emit('change', next)
  },
})
const past = ref<EditorDocument[]>([])
const future = ref<EditorDocument[]>([])
const selection = ref<EditorRange | null>(null)
const typing = ref<EditorStyle | null>(null)
const typingAt = ref<EditorPoint | null>(null)
const composing = ref(false)
const linkOpen = ref(false)
const linkKey = ref(0)
const linkInitial = ref<FormValues>({ href: '' })
const linkRange = ref<EditorRange | null>(null)
const emojiOpen = ref(false)
const emojiQuery = ref('')
const imageOpen = ref(false)
const imageKey = ref(0)
const imageInitial = ref<FormValues>({ file: [], src: '', alt: '' })
const imageTarget = ref<string | null>(null)
const sheetRef = useTemplateRef<HTMLElement>('sheet')
let burst = false
let moving = false
let pastedAt = 0

const copy = computed((): EditorLabels => ({
  ...defaultEditorLabels,
  ...labels,
  label: label ?? labels?.label ?? defaultEditorLabels.label,
  placeholder: placeholder ?? labels?.placeholder ?? defaultEditorLabels.placeholder,
}))
const locked = computed(() => readonly || disabled)
const doc = computed(() => documentState.value.value)
const words = computed(() => countWords(doc.value))
const characters = computed(() => documentText(doc.value).length)
const kindOptions = computed(
  () =>
    [
      { value: 'paragraph', label: copy.value.paragraph },
      { value: 'heading-1', label: copy.value.heading1 },
      { value: 'heading-2', label: copy.value.heading2 },
      { value: 'heading-3', label: copy.value.heading3 },
      { value: 'quote', label: copy.value.quote },
      { value: 'code', label: copy.value.code },
      { value: 'bullet', label: copy.value.bullet },
      { value: 'number', label: copy.value.number },
      { value: 'check', label: copy.value.check },
      { value: 'divider', label: copy.value.divider },
      { value: 'image', label: copy.value.image },
    ] as const satisfies readonly UiOption<string>[],
)
const kindValue = computed(() => {
  const block = focusedBlock()
  if (!block) return 'paragraph'
  return block.kind === 'heading' ? `heading-${block.level}` : block.kind
})
const activeStyle = computed(() => styleNow(documentState.value.value, selection.value))
const activeAlign = computed((): EditorAlign => focusedBlock()?.align ?? 'start')
const visibleEmoji = computed(() => {
  const query = emojiQuery.value.trim().toLowerCase()
  return editorEmojiGroups
    .map((group) => ({
      id: group.id,
      label: emojiLabel(group.id),
      items: group.items.filter(
        (item) =>
          query.length === 0 ||
          item.name.includes(query) ||
          item.glyph.includes(emojiQuery.value.trim()),
      ),
    }))
    .filter((group) => group.items.length > 0)
})
const linkSchema = computed(() =>
  defineForm([
    {
      kind: 'text',
      name: 'href',
      label: copy.value.linkField,
      required: true,
      placeholder: 'https://',
      rules: [
        {
          validate(value) {
            if (typeof value !== 'string' || editorHref(value) === null)
              return copy.value.linkInvalid
            return undefined
          },
        },
      ],
    },
  ]),
)
const imageSchema = computed(() =>
  defineForm([
    {
      kind: 'upload',
      name: 'file',
      label: copy.value.imageFile,
      accept: imageTypes.join(','),
      multiple: false,
      variant: 'picture',
      dropLabel: copy.value.image,
      rules: [
        {
          validate(value) {
            if (!Array.isArray(value) || value.length === 0) return undefined
            const file = value[0]
            if (!(file instanceof File)) return copy.value.imageInvalid
            if (!imageTypes.includes(file.type)) return copy.value.imageInvalid
            if (file.size > imageBytes) return copy.value.imageLarge
            return undefined
          },
        },
      ],
    },
    {
      kind: 'text',
      name: 'src',
      label: copy.value.imageField,
      placeholder: 'https://',
      rules: [
        {
          validate(value, values) {
            const files = values.file
            const hasFile = Array.isArray(files) && files.length > 0
            if (hasFile) return undefined
            if (typeof value === 'string' && value.trim().length === 0 && imageTarget.value)
              return undefined
            if (typeof value !== 'string' || editorAsset(value) === null)
              return copy.value.imageInvalid
            return undefined
          },
        },
      ],
    },
    {
      kind: 'text',
      name: 'alt',
      label: copy.value.imageAlt,
    },
  ]),
)
const command: EditorCommand = {
  toggle: applyMark,
  kind: (value) => applyKind(value),
  link: openLink,
  unlink: removeLink,
  clear: clearActive,
  undo,
  redo,
  move,
  align: applyAlign,
  emoji: pickEmoji,
  image: openImage,
  divider: insertDivider,
}

onMounted(() => {
  document.addEventListener('selectionchange', onSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
})

function nextId(): string {
  serial += 1
  return `${seed}-${serial}`
}

function present(): EditorDocument {
  return doc.value
}

function focusedBlock(): EditorBlock | null {
  const doc = present()
  const id = selection.value?.end.id ?? doc.blocks[0]?.id
  if (!id) return null
  return findBlock(doc, id)
}

function commit(next: EditorDocument, mode: 'input' | 'structure'): void {
  const source = present()
  if (sameDocument(source, next)) return
  if (mode === 'structure' || !burst)
    past.value = [...past.value, cloneDocument(source)].slice(-100)
  future.value = []
  burst = mode === 'input'
  documentState.setValue(next)
}

function undo(): void {
  const previous = past.value[past.value.length - 1]
  if (!previous || locked.value) return
  past.value = past.value.slice(0, -1)
  future.value = [...future.value, cloneDocument(present())]
  burst = false
  typing.value = null
  documentState.setValue(cloneDocument(previous))
}

function redo(): void {
  const next = future.value[future.value.length - 1]
  if (!next || locked.value) return
  future.value = future.value.slice(0, -1)
  past.value = [...past.value, cloneDocument(present())]
  burst = false
  typing.value = null
  documentState.setValue(cloneDocument(next))
}

function applyMark(mark: EditorMark): void {
  if (locked.value) return
  const range = activeRange()
  if (!range) return
  if (collapsed(range)) {
    const block = findBlock(present(), range.start.id)
    if (!block) return
    const style = typing.value ?? marksAt(block, range.start.offset)
    const enable = !style.marks.includes(mark)
    const partner = mark === 'sub' ? 'sup' : mark === 'sup' ? 'sub' : null
    const kept = style.marks.filter((item) => item !== mark && !(enable && item === partner))
    typing.value = {
      marks: canonMarks(enable ? [...kept, mark] : kept),
      ...(style.href ? { href: style.href } : {}),
    }
    typingAt.value = range.end
    return
  }
  typing.value = null
  commit(
    mapSelection(present(), range.start, range.end, (block, from, to) =>
      toggleMark(block, from, to, mark),
    ),
    'structure',
  )
  placeRange(range.start, range.end)
}

function clearActive(): void {
  if (locked.value) return
  const range = activeRange()
  if (!range) return
  if (collapsed(range)) {
    typing.value = { marks: [] }
    typingAt.value = range.end
    return
  }
  typing.value = null
  commit(
    mapSelection(present(), range.start, range.end, (block, from, to) =>
      clearFormatting(block, from, to),
    ),
    'structure',
  )
  placeRange(range.start, range.end)
}

function applyKind(value: string | number | null): void {
  if (typeof value !== 'string' || locked.value) return
  const block = focusedBlock()
  if (!block) return
  let kind: EditorBlockKind
  let level: 1 | 2 | 3 = 1
  if (value === 'image') {
    openImage()
    return
  }
  if (value === 'heading-1' || value === 'heading-2' || value === 'heading-3') {
    kind = 'heading'
    level = value === 'heading-1' ? 1 : value === 'heading-2' ? 2 : 3
  } else if (isEditorBlockKind(value)) kind = value
  else return
  commit(updateBlock(present(), block.id, setBlockKind(block, kind, level)), 'structure')
}

function move(direction: -1 | 1): void {
  const block = focusedBlock()
  if (!block || locked.value) return
  const next = moveBlock(present(), block.id, direction)
  if (sameDocument(next, present())) return
  commit(next, 'structure')
}

function applyAlign(align: EditorAlign): void {
  const block = focusedBlock()
  if (!block || locked.value) return
  commit(updateBlock(present(), block.id, setBlockAlign(block, align)), 'structure')
}

function toggleCheck(block: EditorBlock): void {
  if (locked.value || block.kind !== 'check') return
  commit(updateBlock(present(), block.id, setChecked(block, block.checked !== true)), 'structure')
}

function insertDivider(): void {
  const current = focusedBlock()
  if (!current || locked.value) return
  const rule = setBlockKind(emptyBlock(nextId()), 'divider')
  const placed = placeBlock(present(), current.id, rule)
  const textId = nextId()
  commit(insertAfter(placed.document, placed.caret.id, emptyBlock(textId)), 'structure')
  placeRange({ id: textId, offset: 0 }, { id: textId, offset: 0 })
}

function pickEmoji(glyph: string): void {
  if (locked.value || glyph.length === 0) return
  if (!activeRange()) {
    const block = present().blocks.find((item) => item.kind !== 'divider') ?? present().blocks[0]
    if (!block) return
    const offset = blockText(block).length
    selection.value = {
      start: { id: block.id, offset },
      end: { id: block.id, offset },
    }
  }
  insertText(glyph, 'structure')
  emojiOpen.value = false
  emojiQuery.value = ''
}

function openImage(): void {
  if (locked.value) return
  const block = focusedBlock()
  const editing = block?.kind === 'image' ? block : null
  imageTarget.value = editing?.id ?? null
  const src = editing?.src && !editing.src.startsWith('data:') ? editing.src : ''
  imageInitial.value = { file: [], src, alt: editing?.alt ?? '' }
  imageKey.value += 1
  imageOpen.value = true
}

async function saveImage(values: FormValues): Promise<void> {
  const target = imageTarget.value
  const existing = target ? findBlock(present(), target) : null
  const files = values.file
  const file = Array.isArray(files)
    ? files.find((item): item is File => item instanceof File)
    : undefined
  let src: string | null = null
  if (file) src = editorAsset(await readImage(file))
  else if (typeof values.src === 'string' && values.src.trim().length > 0)
    src = editorAsset(values.src)
  else if (existing?.src) src = existing.src
  if (!src) return
  const alt = typeof values.alt === 'string' ? values.alt.trim() : ''
  if (existing) {
    const next = imageBlock(existing.id, src, alt)
    commit(
      updateBlock(present(), existing.id, {
        ...next,
        runs: existing.runs,
        ...(existing.align === 'center' || existing.align === 'end'
          ? { align: existing.align }
          : {}),
      }),
      'structure',
    )
  } else {
    const current = focusedBlock()
    if (!current) return
    const placed = placeBlock(present(), current.id, imageBlock(nextId(), src, alt))
    commit(placed.document, 'structure')
    placeRange(placed.caret, placed.caret)
  }
  imageOpen.value = false
}

function removeImage(): void {
  const id = imageTarget.value
  if (!id || locked.value) return
  const blocks = present().blocks
  const next =
    blocks.length === 1
      ? { blocks: [emptyBlock(id)] }
      : { blocks: blocks.filter((block) => block.id !== id) }
  commit(next, 'structure')
  imageOpen.value = false
}

async function addImageFile(file: File): Promise<void> {
  if (locked.value || !imageTypes.includes(file.type) || file.size > imageBytes) return
  const src = editorAsset(await readImage(file))
  const current = focusedBlock() ?? present().blocks[0]
  if (!src || !current) return
  const placed = placeBlock(present(), current.id, imageBlock(nextId(), src, file.name))
  commit(placed.document, 'structure')
  placeRange(placed.caret, placed.caret)
}

function readImage(file: File): Promise<string> {
  return file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunk = 8192
    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
    }
    const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type
    return `data:${type};base64,${globalThis.btoa(binary)}`
  })
}

function canMove(direction: -1 | 1): boolean {
  const blocks = present().blocks
  const index = blocks.findIndex((block) => block.id === focusedBlock()?.id)
  return index >= 0 && index + direction >= 0 && index + direction < blocks.length
}

function openLink(): void {
  if (locked.value) return
  const range = activeRange()
  if (!range) return
  linkRange.value = range
  linkInitial.value = { href: activeStyle.value.href ?? '' }
  linkKey.value += 1
  linkOpen.value = true
}

function saveLink(values: FormValues): void {
  const raw = values.href
  const href = typeof raw === 'string' ? editorHref(raw) : null
  const range = linkRange.value
  if (!href || !range) return
  applyHref(range, href)
  linkOpen.value = false
}

function removeLink(): void {
  const range = linkRange.value ?? activeRange()
  if (!range) return
  applyHref(range, null)
  linkOpen.value = false
}

function applyHref(range: EditorRange, href: string | null): void {
  if (collapsed(range)) {
    const block = findBlock(present(), range.start.id)
    const style = block ? marksAt(block, range.start.offset) : { marks: [] as const }
    typing.value = { marks: style.marks, ...(href ? { href } : {}) }
    typingAt.value = range.end
    placeRange(range.end, range.end)
    return
  }
  commit(
    mapSelection(present(), range.start, range.end, (block, from, to) =>
      setLink(block, from, to, href),
    ),
    'structure',
  )
  placeRange(range.start, range.end)
}

function insertText(text: string, mode: 'input' | 'structure' = 'input'): void {
  if (locked.value || text.length === 0) return
  const range = activeRange()
  if (!range) return
  let result = pasteText(present(), range.start, range.end, text, styleFor(range), nextId)
  const block = findBlock(result.document, result.caret.id)
  const shortcut = block ? finishedShortcut(block, result.caret.offset) : null
  if (block && shortcut) {
    result = {
      document: updateBlock(result.document, block.id, shortcut),
      caret: { id: shortcut.id, offset: blockText(shortcut).length },
    }
  }
  commit(result.document, mode)
  placeRange(result.caret, result.caret)
}

function removeText(direction: -1 | 1, unit: 'char' | 'word' | 'line'): void {
  if (locked.value) return
  const range = activeRange()
  if (!range) return
  if (!collapsed(range)) {
    const result = deleteRange(present(), range.start, range.end)
    commit(result.document, 'input')
    placeRange(result.caret, result.caret)
    return
  }
  const block = findBlock(present(), range.start.id)
  if (!block) return
  const text = blockText(block)
  const offset = range.start.offset
  if (direction < 0 && offset === 0) {
    const result = mergeWith(present(), block.id, -1)
    if (sameDocument(result.document, present())) return
    commit(result.document, 'structure')
    placeRange(result.caret, result.caret)
    return
  }
  if (direction > 0 && offset === text.length) {
    const result = mergeWith(present(), block.id, 1)
    if (sameDocument(result.document, present())) return
    commit(result.document, 'structure')
    placeRange(result.caret, result.caret)
    return
  }
  const next = shiftOffset(text, offset, unit, direction)
  const from = Math.min(offset, next)
  const edited = editText(block, from, Math.max(offset, next), '')
  commit(updateBlock(present(), block.id, edited), 'input')
  placeRange({ id: block.id, offset: from }, { id: block.id, offset: from })
}

function enter(block: EditorBlock, soft: boolean): void {
  const range = activeRange()
  if (!range || locked.value) return
  if (soft || block.kind === 'code') {
    insertText('\n')
    return
  }
  const base = collapsed(range)
    ? present()
    : deleteRange(present(), range.start, range.end).document
  const point = collapsed(range)
    ? range.start
    : deleteRange(present(), range.start, range.end).caret
  const result = splitAt(base, point, nextId())
  commit(result.document, 'structure')
  placeRange(result.caret, result.caret)
}

function onKeydown(event: KeyboardEvent, block: EditorBlock): void {
  if (locked.value || event.isComposing || composing.value) return
  const key = event.key.toLowerCase()
  const mod = event.metaKey || event.ctrlKey
  if (mod && key === 'b') return runKey(event, () => applyMark('bold'))
  if (mod && key === 'i') return runKey(event, () => applyMark('italic'))
  if (mod && key === 'u') return runKey(event, () => applyMark('underline'))
  if (mod && key === 'e') return runKey(event, () => applyMark('code'))
  if (mod && event.shiftKey && key === 'x') return runKey(event, () => applyMark('strike'))
  if (mod && key === 'k') return runKey(event, openLink)
  if (mod && event.shiftKey && key === 'z') return runKey(event, redo)
  if (mod && key === 'z') return runKey(event, undo)
  if (mod && key === 'y') return runKey(event, redo)
  if (mod && event.altKey && key === '1') return runKey(event, () => applyKind('heading-1'))
  if (mod && event.altKey && key === '2') return runKey(event, () => applyKind('heading-2'))
  if (mod && event.altKey && key === '3') return runKey(event, () => applyKind('heading-3'))
  if (mod && event.altKey && key === '0') return runKey(event, () => applyKind('paragraph'))
  if (event.altKey && event.key === 'ArrowUp') return runKey(event, () => move(-1))
  if (event.altKey && event.key === 'ArrowDown') return runKey(event, () => move(1))
  if (event.key === 'Enter') return runKey(event, () => enter(block, event.shiftKey))
  if (!mod && event.key.startsWith('Arrow')) nudge(event, block)
}

function onBeforeInput(event: InputEvent): void {
  if (event.isComposing || composing.value) return
  if (locked.value) {
    event.preventDefault()
    return
  }
  const type = event.inputType
  if (type === 'insertText') {
    event.preventDefault()
    insertText(event.data ?? '')
    return
  }
  if (type === 'insertFromPaste' || type === 'insertFromDrop') {
    event.preventDefault()
    if (Date.now() - pastedAt < 40) return
    pastedAt = Date.now()
    const text = event.dataTransfer?.getData('text/plain') ?? event.data ?? ''
    insertText(text)
    return
  }
  if (type === 'deleteContentBackward') return runInput(event, () => removeText(-1, 'char'))
  if (type === 'deleteContentForward') return runInput(event, () => removeText(1, 'char'))
  if (type === 'deleteWordBackward') return runInput(event, () => removeText(-1, 'word'))
  if (type === 'deleteWordForward') return runInput(event, () => removeText(1, 'word'))
  if (type === 'deleteSoftLineBackward' || type === 'deleteHardLineBackward') {
    return runInput(event, () => removeText(-1, 'line'))
  }
  if (type === 'deleteSoftLineForward' || type === 'deleteHardLineForward') {
    return runInput(event, () => removeText(1, 'line'))
  }
  if (type === 'historyUndo') return runInput(event, undo)
  if (type === 'historyRedo') return runInput(event, redo)
  if (
    type === 'insertParagraph' ||
    type === 'insertLineBreak' ||
    type.startsWith('format') ||
    type.startsWith('delete')
  ) {
    event.preventDefault()
  }
}

function onPaste(event: ClipboardEvent): void {
  if (locked.value || composing.value) return
  const file = imageFile(event.clipboardData?.files)
  if (file) {
    event.preventDefault()
    void addImageFile(file)
    return
  }
  event.preventDefault()
  if (Date.now() - pastedAt < 40) return
  pastedAt = Date.now()
  insertText(event.clipboardData?.getData('text/plain') ?? '')
}

function onCopy(event: ClipboardEvent): void {
  const range = activeRange()
  if (!range || range.start.id === range.end.id) return
  event.preventDefault()
  event.clipboardData?.setData('text/plain', selectedText(present(), range.start, range.end))
}

function onCut(event: ClipboardEvent): void {
  if (locked.value) return
  const range = activeRange()
  if (!range) return
  event.preventDefault()
  event.clipboardData?.setData('text/plain', selectedText(present(), range.start, range.end))
  const result = deleteRange(present(), range.start, range.end)
  commit(result.document, 'structure')
  placeRange(result.caret, result.caret)
}

function onDrop(event: DragEvent): void {
  if (locked.value) return
  const file = imageFile(event.dataTransfer?.files)
  if (file) {
    event.preventDefault()
    void addImageFile(file)
    return
  }
  const text = event.dataTransfer?.getData('text/plain') ?? ''
  if (text.length === 0) return
  event.preventDefault()
  if (Date.now() - pastedAt < 40) return
  pastedAt = Date.now()
  insertText(text)
}

function imageFile(list: FileList | undefined): File | null {
  if (!list) return null
  return [...list].find((item) => imageTypes.includes(item.type)) ?? null
}

function onCompositionEnd(event: CompositionEvent): void {
  composing.value = false
  const root = event.currentTarget
  if (!(root instanceof HTMLElement)) return
  const id = root.dataset.block
  const block = id ? findBlock(present(), id) : null
  if (!block) return
  const native = window.getSelection()
  const caret =
    native && root.contains(native.focusNode)
      ? pointFrom(native.focusNode, native.focusOffset)
      : null
  const next = reconcileText(block, root.textContent ?? '', marksAt(block, caret?.offset ?? 0))
  commit(updateBlock(present(), block.id, next), 'input')
  const offset = caret?.offset ?? blockText(next).length
  placeRange({ id: block.id, offset }, { id: block.id, offset })
}

function nudge(event: KeyboardEvent, block: EditorBlock): void {
  const range = activeRange()
  const root = event.currentTarget
  if (!range || !collapsed(range) || !(root instanceof HTMLElement)) return
  const text = blockText(block)
  if (event.key === 'ArrowLeft' && range.start.offset === 0) {
    const point = neighbor(block.id, -1)
    if (!point) return
    event.preventDefault()
    placeRange(point, point)
    return
  }
  if (event.key === 'ArrowRight' && range.start.offset === text.length) {
    const point = neighbor(block.id, 1)
    if (!point) return
    event.preventDefault()
    placeRange(point, point)
    return
  }
  if (event.key === 'ArrowUp' && atEdge(root, 'start')) {
    const point = neighbor(block.id, -1)
    if (!point) return
    event.preventDefault()
    placeRange(point, point)
    return
  }
  if (event.key === 'ArrowDown' && atEdge(root, 'end')) {
    const point = neighbor(block.id, 1)
    if (!point) return
    event.preventDefault()
    placeRange(point, point)
  }
}

function onSelectionChange(): void {
  if (moving || composing.value) return
  const sheet = sheetRef.value
  const native = window.getSelection()
  if (!sheet || !native?.anchorNode || !sheet.contains(native.anchorNode)) return
  const next = readSelection()
  if (!next) return
  const anchor = typingAt.value
  if (
    anchor &&
    (next.start.id !== next.end.id ||
      next.start.offset !== next.end.offset ||
      next.end.id !== anchor.id ||
      next.end.offset !== anchor.offset)
  ) {
    typing.value = null
    typingAt.value = null
  }
  selection.value = next
}

function holdSelection(): void {
  const next = readSelection()
  if (next) selection.value = next
}

function activeRange(): EditorRange | null {
  return readSelection() ?? selection.value
}

function readSelection(): EditorRange | null {
  const native = window.getSelection()
  if (!native || native.rangeCount === 0) return null
  const start = pointFrom(native.anchorNode, native.anchorOffset)
  const end = pointFrom(native.focusNode, native.focusOffset)
  if (!start || !end) return null
  const ordered = orderRange(present(), start, end)
  if (!ordered) return null
  return ordered
}

function placeRange(start: EditorPoint, end: EditorPoint): void {
  selection.value = { start, end }
  if (typing.value) typingAt.value = end
  moving = true
  void nextTick(() => {
    const root = blockElement(end.id)
    if (root) {
      root.focus()
      setDomRange(root, start.id === end.id ? start.offset : end.offset, end.offset)
    }
    moving = false
  })
}

function blockElement(id: string): HTMLElement | null {
  const node = sheetRef.value?.querySelector(`[data-block="${cssEscape(id)}"]`)
  return node instanceof HTMLElement ? node : null
}

function captionFor(block: EditorBlock): string | undefined {
  if (block.kind === 'image' && blockText(block).length === 0) return copy.value.imageCaption
  return placeholderFor(block)
}

function placeholderFor(block: EditorBlock): string | undefined {
  const doc = present()
  if (doc.blocks.length !== 1 || doc.blocks[0]?.id !== block.id) return undefined
  if (block.kind !== 'paragraph' || blockText(block).length > 0) return undefined
  return copy.value.placeholder
}

function markLabel(mark: EditorMark): string {
  if (mark === 'bold') return copy.value.bold
  if (mark === 'italic') return copy.value.italic
  if (mark === 'underline') return copy.value.underline
  if (mark === 'strike') return copy.value.strike
  if (mark === 'highlight') return copy.value.highlight
  if (mark === 'sub') return copy.value.sub
  if (mark === 'sup') return copy.value.sup
  return copy.value.inlineCode
}

function alignLabel(align: EditorAlign): string {
  if (align === 'center') return copy.value.alignCenter
  if (align === 'end') return copy.value.alignEnd
  return copy.value.alignStart
}

function emojiLabel(id: EditorEmojiGroupId): string {
  if (id === 'faces') return copy.value.emojiFaces
  if (id === 'nature') return copy.value.emojiNature
  if (id === 'objects') return copy.value.emojiObjects
  if (id === 'symbols') return copy.value.emojiSymbols
  return copy.value.emojiStatus
}

function styleFor(range: EditorRange): EditorStyle {
  if (collapsed(range) && typing.value) return typing.value
  const block = findBlock(present(), range.start.id)
  if (!block) return { marks: [] }
  return marksAt(block, range.start.offset)
}

function styleNow(doc: EditorDocument, range: EditorRange | null): EditorStyle {
  const block = range ? findBlock(doc, range.end.id) : doc.blocks[0]
  if (!block) return { marks: [] }
  if (!range || collapsed(range))
    return typing.value ?? marksAt(block, range?.end.offset ?? blockText(block).length)
  const ordered = orderRange(doc, range.start, range.end)
  if (!ordered) return { marks: [] }
  const startIndex = doc.blocks.findIndex((item) => item.id === ordered.start.id)
  const endIndex = doc.blocks.findIndex((item) => item.id === ordered.end.id)
  let marks: EditorMark[] = [...editorMarkList()]
  let href: string | undefined
  let seenHref = false
  let any = false
  for (let index = startIndex; index <= endIndex; index += 1) {
    const item = doc.blocks[index]
    if (!item) continue
    const from = index === startIndex ? ordered.start.offset : 0
    const to = index === endIndex ? ordered.end.offset : blockText(item).length
    if (from === to) continue
    any = true
    marks = marks.filter((mark) => rangeHasMark(item, from, to, mark))
    const link = rangeHref(item, from, to)
    if (!seenHref) {
      href = link ?? undefined
      seenHref = true
    } else if ((href ?? null) !== link) href = undefined
  }
  if (!any) return { marks: [] }
  return { marks, ...(href ? { href } : {}) }
}

function editorMarkList(): EditorMark[] {
  return [...editorMarks]
}

function finishedShortcut(block: EditorBlock, caret: number): EditorBlock | null {
  const next = blockShortcut(block)
  if (!next) return null
  const text = blockText(block)
  const prefixes =
    block.kind === 'bullet'
      ? ['[ ] ', '[x] ', '[X] ']
      : [
          '### ',
          '## ',
          '# ',
          '> ',
          '- [ ] ',
          '- [x] ',
          '- [X] ',
          '- ',
          '* ',
          '1. ',
          '```',
          '---',
          '***',
        ]
  if (!prefixes.some((prefix) => caret === prefix.length && text.startsWith(prefix))) return null
  return next
}

function neighbor(id: string, direction: -1 | 1): EditorPoint | null {
  const blocks = present().blocks
  let index = blocks.findIndex((block) => block.id === id)
  if (index < 0) return null
  while (index >= 0 && index < blocks.length) {
    index += direction
    const block = blocks[index]
    if (!block) return null
    if (block.kind === 'divider') continue
    return { id: block.id, offset: direction < 0 ? blockText(block).length : 0 }
  }
  return null
}

function collapsed(range: EditorRange): boolean {
  return range.start.id === range.end.id && range.start.offset === range.end.offset
}

function runKey(event: KeyboardEvent, action: () => void): void {
  event.preventDefault()
  action()
}

function runInput(event: InputEvent, action: () => void): void {
  event.preventDefault()
  action()
}

function pointFrom(node: Node | null, offset: number): EditorPoint | null {
  if (!node) return null
  const element = node instanceof HTMLElement ? node : node.parentElement
  const host = element?.closest('[data-block]')
  if (!(host instanceof HTMLElement) || !host.dataset.block) return null
  if (!sheetRef.value?.contains(host)) return null
  const range = document.createRange()
  range.selectNodeContents(host)
  const safe = Math.min(
    offset,
    node.nodeType === 3 ? (node.textContent?.length ?? 0) : node.childNodes.length,
  )
  range.setEnd(node, Math.max(0, safe))
  return { id: host.dataset.block, offset: range.toString().length }
}

function setDomRange(root: HTMLElement, start: number, end: number): void {
  const native = window.getSelection()
  if (!native) return
  const from = locate(root, start)
  const to = locate(root, end)
  const range = document.createRange()
  if (!from || !to) {
    range.selectNodeContents(root)
    range.collapse(true)
  } else {
    range.setStart(from.node, from.offset)
    range.setEnd(to.node, to.offset)
  }
  native.removeAllRanges()
  native.addRange(range)
}

function locate(root: HTMLElement, offset: number): { node: Node; offset: number } | null {
  const nodes: Node[] = []
  collectText(root, nodes)
  let remaining = offset
  for (const node of nodes) {
    const length = node.textContent?.length ?? 0
    if (remaining <= length) return { node, offset: remaining }
    remaining -= length
  }
  const last = nodes[nodes.length - 1]
  if (!last) return null
  return { node: last, offset: last.textContent?.length ?? 0 }
}

function collectText(node: Node, into: Node[]): void {
  if (node.nodeType === 3) {
    if ((node.textContent ?? '').length > 0) into.push(node)
    return
  }
  let child = node.firstChild
  while (child) {
    collectText(child, into)
    child = child.nextSibling
  }
}

function atEdge(root: HTMLElement, edge: 'start' | 'end'): boolean {
  const native = window.getSelection()
  if (!native || native.rangeCount === 0) return true
  const range = native.getRangeAt(0).cloneRange()
  range.collapse(edge === 'start')
  const rect = range.getClientRects()[0]
  if (!rect) return true
  const host = root.getBoundingClientRect()
  return edge === 'start' ? rect.top - host.top < 4 : host.bottom - rect.bottom < 4
}

function cssEscape(value: string): string {
  return globalThis.CSS.escape(value)
}

defineExpose({ undo, redo, command })
</script>

<template>
  <section
    class="ui-editor"
    :data-disabled="disabled || undefined"
    :aria-disabled="disabled || undefined"
  >
    <slot
      name="toolbar"
      :labels="copy"
      :marks="activeStyle.marks"
      :kind="kindValue"
      :disabled="locked"
      :can-undo="past.length > 0"
      :can-redo="future.length > 0"
      :command="command"
    >
      <ui-toolbar :label="copy.label">
        <div class="ui-editor__kind" @mousedown="holdSelection">
          <ui-select
            :model-value="kindValue"
            :options="kindOptions"
            :disabled="locked"
            size="sm"
            :label="copy.blockType"
            @update:model-value="applyKind"
          />
        </div>
        <ui-button
          v-for="item in markItems"
          :key="item.mark"
          icon-only
          size="sm"
          :variant="activeStyle.marks.includes(item.mark) ? 'primary' : 'secondary'"
          :label="markLabel(item.mark)"
          :title="markLabel(item.mark)"
          :disabled="locked"
          :aria-pressed="activeStyle.marks.includes(item.mark)"
          @mousedown.prevent
          @click="applyMark(item.mark)"
        >
          <template #leading>
            <span :data-mark="item.mark">{{ item.glyph }}</span>
          </template>
        </ui-button>
        <ui-button
          v-for="item in alignItems"
          :key="item.align"
          icon-only
          size="sm"
          :variant="activeAlign === item.align ? 'primary' : 'secondary'"
          :label="alignLabel(item.align)"
          :title="alignLabel(item.align)"
          :disabled="locked"
          :aria-pressed="activeAlign === item.align"
          @mousedown.prevent
          @click="applyAlign(item.align)"
        >
          <template #leading>{{ item.glyph }}</template>
        </ui-button>
        <ui-button
          size="sm"
          :variant="activeStyle.href ? 'primary' : 'secondary'"
          :disabled="locked"
          :aria-pressed="Boolean(activeStyle.href)"
          @mousedown.prevent
          @click="openLink"
        >
          {{ copy.link }}
        </ui-button>
        <ui-popover v-model:open="emojiOpen" placement="bottom" align="start" :disabled="locked">
          <template #trigger>
            <ui-button
              size="sm"
              variant="secondary"
              :disabled="locked"
              @mousedown.prevent="holdSelection"
            >
              {{ copy.emoji }}
            </ui-button>
          </template>
          <div class="ui-editor__emoji">
            <ui-input
              v-model="emojiQuery"
              size="sm"
              :label="copy.emojiSearch"
              :placeholder="copy.emojiSearch"
            />
            <p v-if="visibleEmoji.length === 0" class="ui-editor__emoji-empty">
              {{ copy.emojiEmpty }}
            </p>
            <section v-for="group in visibleEmoji" :key="group.id">
              <p class="ui-editor__emoji-label">{{ group.label }}</p>
              <div class="ui-editor__glyphs">
                <button
                  v-for="item in group.items"
                  :key="`${group.id}-${item.name}`"
                  type="button"
                  class="ui-editor__glyph"
                  :aria-label="item.name"
                  @mousedown.prevent
                  @click="pickEmoji(item.glyph)"
                >
                  {{ item.glyph }}
                </button>
              </div>
            </section>
          </div>
        </ui-popover>
        <ui-button
          size="sm"
          variant="secondary"
          :disabled="locked"
          @mousedown.prevent
          @click="openImage"
        >
          {{ copy.image }}
        </ui-button>
        <ui-button
          size="sm"
          variant="secondary"
          :disabled="locked"
          @mousedown.prevent
          @click="insertDivider"
        >
          {{ copy.divider }}
        </ui-button>
        <ui-button
          size="sm"
          variant="secondary"
          :disabled="locked"
          @mousedown.prevent
          @click="clearActive"
        >
          {{ copy.clear }}
        </ui-button>
        <template #end>
          <ui-button
            icon-only
            size="sm"
            variant="secondary"
            :label="copy.moveUp"
            :title="copy.moveUp"
            :disabled="locked || !canMove(-1)"
            @mousedown.prevent
            @click="move(-1)"
          >
            <template #leading>↑</template>
          </ui-button>
          <ui-button
            icon-only
            size="sm"
            variant="secondary"
            :label="copy.moveDown"
            :title="copy.moveDown"
            :disabled="locked || !canMove(1)"
            @mousedown.prevent
            @click="move(1)"
          >
            <template #leading>↓</template>
          </ui-button>
          <ui-button
            icon-only
            size="sm"
            variant="secondary"
            :label="copy.undo"
            :title="copy.undo"
            :disabled="locked || past.length === 0"
            @mousedown.prevent
            @click="undo"
          >
            <template #leading>↺</template>
          </ui-button>
          <ui-button
            icon-only
            size="sm"
            variant="secondary"
            :label="copy.redo"
            :title="copy.redo"
            :disabled="locked || future.length === 0"
            @mousedown.prevent
            @click="redo"
          >
            <template #leading>↻</template>
          </ui-button>
        </template>
      </ui-toolbar>
    </slot>

    <div ref="sheet" class="ui-editor__sheet" :aria-label="copy.label">
      <div
        v-for="block in doc.blocks"
        :key="block.id"
        class="ui-editor__row"
        :data-kind="block.kind"
        :data-level="block.level"
        :data-align="block.align === 'center' || block.align === 'end' ? block.align : undefined"
      >
        <div v-if="block.kind === 'divider'" class="ui-editor__rule" role="separator" />
        <template v-else>
          <button
            v-if="block.kind === 'check'"
            type="button"
            class="ui-editor__check"
            role="checkbox"
            :aria-checked="block.checked === true"
            :aria-label="copy.check"
            :disabled="locked"
            @mousedown.prevent
            @click="toggleCheck(block)"
          />
          <div class="ui-editor__body">
            <img
              v-if="block.kind === 'image' && block.src"
              class="ui-editor__photo"
              :src="block.src"
              :alt="block.alt ?? ''"
            />
            <div
              class="ui-editor__block"
              :data-block="block.id"
              :data-placeholder="captionFor(block)"
              :contenteditable="locked ? 'false' : 'true'"
              :spellcheck="spellcheck"
              aria-multiline="true"
              :aria-readonly="readonly || undefined"
              @keydown="onKeydown($event, block)"
              @beforeinput="onBeforeInput"
              @paste="onPaste"
              @copy="onCopy"
              @cut="onCut"
              @drop="onDrop"
              @compositionstart="composing = true"
              @compositionend="onCompositionEnd"
            >
              <br v-if="blockText(block).length === 0" />
              <template v-else>
                <span
                  v-for="(run, index) in block.runs"
                  :key="`${block.id}-${index}`"
                  :data-bold="run.marks.includes('bold') || undefined"
                  :data-italic="run.marks.includes('italic') || undefined"
                  :data-underline="run.marks.includes('underline') || undefined"
                  :data-strike="run.marks.includes('strike') || undefined"
                  :data-code="run.marks.includes('code') || undefined"
                  :data-highlight="run.marks.includes('highlight') || undefined"
                  :data-sub="run.marks.includes('sub') || undefined"
                  :data-sup="run.marks.includes('sup') || undefined"
                >
                  <a v-if="run.href" :href="run.href" @mousedown.prevent @click.prevent>{{
                    run.text
                  }}</a>
                  <template v-else>{{ run.text }}</template>
                </span>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <slot name="status" :words="words" :characters="characters">
      <p class="ui-editor__status">{{ words }} {{ copy.words }}</p>
    </slot>

    <ui-dialog
      v-model:open="linkOpen"
      :title="copy.linkTitle"
      :description="copy.linkDescription"
      size="sm"
    >
      <ui-form
        v-if="linkOpen"
        :key="linkKey"
        :schema="linkSchema"
        :initial="linkInitial"
        :label="copy.linkTitle"
        :submit-label="copy.linkSave"
        @submit="saveLink"
      />
      <template v-if="activeStyle.href" #footer>
        <ui-button variant="danger" @click="removeLink">{{ copy.linkRemove }}</ui-button>
      </template>
    </ui-dialog>
    <ui-dialog
      v-model:open="imageOpen"
      :title="copy.imageTitle"
      :description="copy.imageDescription"
      size="md"
    >
      <ui-form
        v-if="imageOpen"
        :key="imageKey"
        :schema="imageSchema"
        :initial="imageInitial"
        :label="copy.imageTitle"
        :submit-label="copy.imageSave"
        @submit="saveImage"
      />
      <template v-if="imageTarget" #footer>
        <ui-button variant="danger" @click="removeImage">{{ copy.imageRemove }}</ui-button>
      </template>
    </ui-dialog>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-editor {
  @include surface;
  display: grid;
  gap: var(--ui-space-2);
  min-width: 0;
  padding: var(--ui-space-2);

  &[data-disabled='true'] {
    opacity: 0.55;
  }
}

.ui-editor__kind {
  width: 11rem;
}

.ui-editor__emoji {
  display: grid;
  gap: var(--ui-space-2);
  width: min(18rem, 70vw);
  max-height: 16rem;
  overflow: auto;
}

.ui-editor__emoji-label,
.ui-editor__emoji-empty {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-editor__glyphs {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 2px;
}

.ui-editor__glyph {
  @include focus-ring;
  display: grid;
  place-items: center;
  height: 1.75rem;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  font-size: var(--ui-font-size-md);
  cursor: pointer;

  &:hover {
    background: var(--ui-color-subtle);
  }
}

.ui-editor__sheet {
  display: grid;
  gap: var(--ui-space-2);
  min-height: 12rem;
  padding: var(--ui-space-3);
  counter-reset: item;
}

.ui-editor__row {
  min-width: 0;
}

.ui-editor__row[data-kind='bullet'],
.ui-editor__row[data-kind='number'],
.ui-editor__row[data-kind='check'] {
  display: grid;
  grid-template-columns: 1.4rem minmax(0, 1fr);
  align-items: baseline;
}

.ui-editor__row[data-kind='number'] {
  counter-increment: item;
}

.ui-editor__row:not([data-kind='number']) + .ui-editor__row[data-kind='number'] {
  counter-reset: item;
}

.ui-editor__row[data-kind='bullet']::before,
.ui-editor__row[data-kind='number']::before {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-editor__row[data-kind='bullet']::before {
  content: '•';
}

.ui-editor__row[data-kind='number']::before {
  content: counter(item) '.';
}

.ui-editor__row[data-align='center'] {
  text-align: center;
}

.ui-editor__row[data-align='end'] {
  text-align: end;
}

.ui-editor__body {
  display: contents;
  min-width: 0;
}

.ui-editor__row[data-kind='image'] .ui-editor__body {
  display: grid;
  gap: var(--ui-space-2);
}

.ui-editor__photo {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: var(--ui-radius-md);
}

.ui-editor__row[data-align='center'] .ui-editor__photo {
  margin-inline: auto;
}

.ui-editor__row[data-align='end'] .ui-editor__photo {
  margin-inline-start: auto;
}

.ui-editor__rule {
  border-block-start: 1px solid var(--ui-color-border);
}

.ui-editor__check {
  @include focus-ring;
  width: 0.9rem;
  height: 0.9rem;
  margin-top: 0.25rem;
  padding: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: var(--ui-color-accent);
  font-size: 0.65rem;
  line-height: 1;

  &[aria-checked='true']::before {
    content: '✓';
  }
}

.ui-editor__block {
  min-width: 0;
  min-height: 1.5em;
  color: var(--ui-color-fg);
  font: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  outline: none;
}

.ui-editor__block[data-placeholder]::before {
  content: attr(data-placeholder);
  color: var(--ui-color-muted);
  pointer-events: none;
}

.ui-editor__row[data-kind='heading'] .ui-editor__block {
  font-weight: 560;
  letter-spacing: -0.03em;
}

.ui-editor__row[data-kind='heading'][data-level='1'] .ui-editor__block {
  font-size: var(--ui-font-size-xl);
}

.ui-editor__row[data-kind='heading'][data-level='2'] .ui-editor__block {
  font-size: var(--ui-font-size-lg);
}

.ui-editor__row[data-kind='heading'][data-level='3'] .ui-editor__block {
  font-size: var(--ui-font-size-md);
}

.ui-editor__row[data-kind='quote'] .ui-editor__block {
  padding-inline-start: var(--ui-space-3);
  border-inline-start: 2px solid var(--ui-color-accent);
  color: var(--ui-color-muted);
}

.ui-editor__row[data-kind='code'] .ui-editor__block {
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-subtle);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-sm);
}

.ui-editor__block [data-bold] {
  font-weight: 640;
}

.ui-editor__block [data-italic] {
  font-style: italic;
}

.ui-editor__block [data-underline] {
  text-decoration: underline;
}

.ui-editor__block [data-strike] {
  text-decoration: line-through;
}

.ui-editor__block [data-underline][data-strike] {
  text-decoration: underline line-through;
}

.ui-editor__block [data-code] {
  padding: 0 0.2em;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-subtle);
  font-family: var(--ui-font-mono);
  font-size: 0.92em;
}

.ui-editor__block [data-highlight] {
  background: color-mix(in oklch, var(--ui-color-accent) 18%, transparent);
}

.ui-editor__block [data-sub] {
  vertical-align: sub;
  font-size: 0.75em;
}

.ui-editor__block [data-sup] {
  vertical-align: super;
  font-size: 0.75em;
}

.ui-editor__block a {
  color: var(--ui-color-accent);
  text-decoration-line: underline;
}

.ui-editor__status {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

[data-mark='bold'] {
  font-weight: 700;
}

[data-mark='italic'] {
  font-style: italic;
}

[data-mark='underline'] {
  text-decoration: underline;
}

[data-mark='strike'] {
  text-decoration: line-through;
}
</style>
