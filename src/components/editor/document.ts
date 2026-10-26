export const editorMarks = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'highlight',
  'sub',
  'sup',
] as const

export type EditorMark = (typeof editorMarks)[number]

export type EditorAlign = 'start' | 'center' | 'end'

export type EditorBlockKind =
  'paragraph' | 'heading' | 'quote' | 'code' | 'bullet' | 'number' | 'check' | 'divider' | 'image'

export interface EditorRun {
  readonly text: string
  readonly marks: readonly EditorMark[]
  readonly href?: string
}

export interface EditorBlock {
  readonly id: string
  readonly kind: EditorBlockKind
  readonly level: 1 | 2 | 3
  readonly runs: readonly EditorRun[]
  readonly align?: EditorAlign
  readonly checked?: boolean
  readonly src?: string
  readonly alt?: string
}

export interface EditorDocument {
  readonly blocks: readonly EditorBlock[]
}

export interface EditorPoint {
  readonly id: string
  readonly offset: number
}

export interface EditorStyle {
  readonly marks: readonly EditorMark[]
  readonly href?: string
}

export interface EditorCaret {
  readonly document: EditorDocument
  readonly caret: EditorPoint
}

const blockKinds = [
  'paragraph',
  'heading',
  'quote',
  'code',
  'bullet',
  'number',
  'check',
  'divider',
  'image',
] as const

export function isEditorMark(value: string): value is EditorMark {
  return (editorMarks as readonly string[]).includes(value)
}

export function isEditorBlockKind(value: string): value is EditorBlockKind {
  return (blockKinds as readonly string[]).includes(value)
}

export function canonMarks(marks: readonly EditorMark[]): EditorMark[] {
  return editorMarks.filter((mark) => marks.includes(mark))
}

export function editorHref(value: string): string | null {
  const href = value.trim()
  if (href.length === 0) return null
  if (/^(?:javascript|data|vbscript):/i.test(href)) return null
  return href
}

export function editorAsset(value: string): string | null {
  const src = value.trim()
  if (src.length === 0) return null
  if (/^(?:javascript|vbscript|blob):/i.test(src)) return null
  if (/^data:/i.test(src)) {
    return /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(src) ? src : null
  }
  return src
}

export function emptyBlock(id: string, kind: EditorBlockKind = 'paragraph'): EditorBlock {
  return { id, kind, level: 1, runs: [] }
}

export function emptyDocument(id: string): EditorDocument {
  return { blocks: [emptyBlock(id)] }
}

export function blockText(block: EditorBlock): string {
  return block.runs.map((run) => run.text).join('')
}

export function documentText(doc: EditorDocument): string {
  return doc.blocks.map((block) => blockText(block)).join('\n')
}

export function countWords(doc: EditorDocument): number {
  const text = documentText(doc).trim()
  if (text.length === 0) return 0
  return text.split(/\s+/u).length
}

export function sameDocument(left: EditorDocument, right: EditorDocument): boolean {
  if (left.blocks.length !== right.blocks.length) return false
  return left.blocks.every((block, index) => sameBlock(block, right.blocks[index]))
}

export function cloneDocument(doc: EditorDocument): EditorDocument {
  return {
    blocks: doc.blocks.map((block) =>
      copyBlock({
        ...block,
        runs: block.runs.map((run) => ({
          text: run.text,
          marks: canonMarks(run.marks),
          ...(run.href ? { href: run.href } : {}),
        })),
      }),
    ),
  }
}

export function findBlock(doc: EditorDocument, id: string): EditorBlock | null {
  return doc.blocks.find((block) => block.id === id) ?? null
}

export function normalizeRuns(runs: readonly EditorRun[]): EditorRun[] {
  const next: EditorRun[] = []
  for (const run of runs) {
    if (run.text.length === 0) continue
    const marks = canonMarks(run.marks)
    const href = run.href ? (editorHref(run.href) ?? undefined) : undefined
    const previous = next[next.length - 1]
    if (previous && sameStyle(previous, { text: run.text, marks, ...(href ? { href } : {}) })) {
      next[next.length - 1] = { ...previous, text: previous.text + run.text }
      continue
    }
    next.push({ text: run.text, marks, ...(href ? { href } : {}) })
  }
  return next
}

export function editText(
  block: EditorBlock,
  start: number,
  end: number,
  text: string,
  marks: readonly EditorMark[] = [],
  href?: string,
): EditorBlock {
  const length = blockText(block).length
  const from = clamp(Math.min(start, end), 0, length)
  const to = clamp(Math.max(start, end), 0, length)
  const safe = href ? (editorHref(href) ?? undefined) : undefined
  const inserted: EditorRun[] =
    text.length === 0 ? [] : [{ text, marks: canonMarks(marks), ...(safe ? { href: safe } : {}) }]
  return {
    ...block,
    runs: normalizeRuns([
      ...takeBefore(block.runs, from),
      ...inserted,
      ...takeAfter(block.runs, to),
    ]),
  }
}

export function marksAt(block: EditorBlock, offset: number): EditorStyle {
  const text = blockText(block)
  if (text.length === 0) return { marks: [] }
  const at = clamp(offset <= 0 ? 0 : offset - 1, 0, text.length - 1)
  const run = runCovering(block.runs, at)
  if (!run) return { marks: [] }
  return { marks: canonMarks(run.marks), ...(run.href ? { href: run.href } : {}) }
}

export function toggleMark(
  block: EditorBlock,
  start: number,
  end: number,
  mark: EditorMark,
): EditorBlock {
  const length = blockText(block).length
  const from = clamp(Math.min(start, end), 0, length)
  const to = clamp(Math.max(start, end), 0, length)
  if (from === to) return block
  const enable = !rangeHasMark(block, from, to, mark)
  const partner = mark === 'sub' ? 'sup' : mark === 'sup' ? 'sub' : null
  return mapMiddle(block, from, to, (run) => {
    const kept = run.marks.filter((item) => item !== mark && !(enable && item === partner))
    const marks = canonMarks(enable ? [...kept, mark] : kept)
    return { text: run.text, marks, ...(run.href ? { href: run.href } : {}) }
  })
}

export function rangeHref(block: EditorBlock, start: number, end: number): string | null {
  const from = Math.min(start, end)
  const to = Math.max(start, end)
  if (from === to) return null
  let href: string | null = null
  let seen = false
  let cursor = 0
  for (const run of block.runs) {
    const runEnd = cursor + run.text.length
    if (cursor < to && runEnd > from && run.text.length > 0) {
      const value = run.href ?? null
      if (!seen) {
        href = value
        seen = true
      } else if (href !== value) return null
    }
    cursor = runEnd
  }
  return seen ? href : null
}

export function rangeHasMark(
  block: EditorBlock,
  start: number,
  end: number,
  mark: EditorMark,
): boolean {
  const middle = middleRuns(block.runs, start, end)
  if (middle.length === 0) return false
  return middle.every((run) => run.marks.includes(mark))
}

export function setLink(
  block: EditorBlock,
  start: number,
  end: number,
  href: string | null,
): EditorBlock {
  const length = blockText(block).length
  const from = clamp(Math.min(start, end), 0, length)
  const to = clamp(Math.max(start, end), 0, length)
  if (from === to) return block
  const safe = href === null ? null : editorHref(href)
  if (href !== null && safe === null) return block
  return mapMiddle(block, from, to, (run) => {
    const marks = canonMarks(run.marks)
    if (safe === null) return { text: run.text, marks }
    return { text: run.text, marks, href: safe }
  })
}

export function clearFormatting(block: EditorBlock, start: number, end: number): EditorBlock {
  const length = blockText(block).length
  const from = clamp(Math.min(start, end), 0, length)
  const to = clamp(Math.max(start, end), 0, length)
  if (from === to) return block
  return mapMiddle(block, from, to, (run) => ({ text: run.text, marks: [] }))
}

export function setBlockKind(
  block: EditorBlock,
  kind: EditorBlockKind,
  level: 1 | 2 | 3 = 1,
): EditorBlock {
  return copyBlock({
    ...block,
    kind,
    level,
    runs: kind === 'divider' ? [] : block.runs,
  })
}

export function setBlockAlign(block: EditorBlock, align: EditorAlign): EditorBlock {
  return copyBlock({ ...block, align })
}

export function setChecked(block: EditorBlock, checked: boolean): EditorBlock {
  return copyBlock({ ...block, kind: 'check', checked })
}

export function imageBlock(id: string, src: string, alt = ''): EditorBlock {
  const safe = editorAsset(src)
  const name = alt.trim()
  return copyBlock({
    id,
    kind: 'image',
    level: 1,
    runs: [],
    ...(safe ? { src: safe } : {}),
    ...(name ? { alt: name } : {}),
  })
}

export function blockShortcut(block: EditorBlock): EditorBlock | null {
  const text = blockText(block)
  if (block.kind === 'bullet') {
    if (text.startsWith('[ ] ')) return setChecked(editText(block, 0, 4, ''), false)
    if (text.startsWith('[x] ') || text.startsWith('[X] '))
      return setChecked(editText(block, 0, 4, ''), true)
    return null
  }
  if (block.kind !== 'paragraph') return null
  if (text === '```') return setBlockKind(editText(block, 0, 3, ''), 'code')
  if (text === '---' || text === '***')
    return setBlockKind(editText(block, 0, text.length, ''), 'divider')
  if (text.startsWith('- [ ] ')) return setChecked(editText(block, 0, 6, ''), false)
  if (text.startsWith('- [x] ') || text.startsWith('- [X] '))
    return setChecked(editText(block, 0, 6, ''), true)
  const rules = [
    { prefix: '### ', kind: 'heading', level: 3 },
    { prefix: '## ', kind: 'heading', level: 2 },
    { prefix: '# ', kind: 'heading', level: 1 },
    { prefix: '> ', kind: 'quote', level: 1 },
    { prefix: '- ', kind: 'bullet', level: 1 },
    { prefix: '* ', kind: 'bullet', level: 1 },
    { prefix: '1. ', kind: 'number', level: 1 },
  ] as const
  for (const rule of rules) {
    if (!text.startsWith(rule.prefix)) continue
    return setBlockKind(editText(block, 0, rule.prefix.length, ''), rule.kind, rule.level)
  }
  return null
}

export function splitBlock(
  block: EditorBlock,
  offset: number,
  nextId: string,
): readonly [EditorBlock, EditorBlock] {
  const at = clamp(offset, 0, blockText(block).length)
  return [
    copyBlock({ ...block, runs: normalizeRuns(takeBefore(block.runs, at)) }),
    copyBlock({
      ...block,
      id: nextId,
      runs: normalizeRuns(takeAfter(block.runs, at)),
    }),
  ]
}

export function mergeBlocks(left: EditorBlock, right: EditorBlock): EditorBlock {
  return copyBlock({ ...left, runs: normalizeRuns([...left.runs, ...right.runs]) })
}

export function insertAfter(doc: EditorDocument, id: string, block: EditorBlock): EditorDocument {
  const index = doc.blocks.findIndex((item) => item.id === id)
  if (index < 0) return { blocks: [...doc.blocks, copyBlock(block)] }
  return {
    blocks: [...doc.blocks.slice(0, index + 1), copyBlock(block), ...doc.blocks.slice(index + 1)],
  }
}

export function placeBlock(doc: EditorDocument, id: string, block: EditorBlock): EditorCaret {
  const current = findBlock(doc, id)
  const vacant =
    current !== null &&
    (current.kind === 'paragraph' || current.kind === 'heading' || current.kind === 'quote') &&
    blockText(current).length === 0
  if (current && vacant) {
    const replacement = copyBlock({ ...block, id: current.id })
    return {
      document: updateBlock(doc, current.id, replacement),
      caret: { id: current.id, offset: 0 },
    }
  }
  const inserted = copyBlock(block)
  return {
    document: insertAfter(doc, id, inserted),
    caret: { id: inserted.id, offset: blockText(inserted).length },
  }
}

export function updateBlock(doc: EditorDocument, id: string, block: EditorBlock): EditorDocument {
  return { blocks: doc.blocks.map((item) => (item.id === id ? block : item)) }
}

export function replaceBlock(
  doc: EditorDocument,
  id: string,
  blocks: readonly EditorBlock[],
): EditorDocument {
  const index = doc.blocks.findIndex((block) => block.id === id)
  if (index < 0) return doc
  const next = [...doc.blocks.slice(0, index), ...blocks, ...doc.blocks.slice(index + 1)]
  return { blocks: next.length > 0 ? next : [emptyBlock(id)] }
}

export function orderRange(
  doc: EditorDocument,
  start: EditorPoint,
  end: EditorPoint,
): { start: EditorPoint; end: EditorPoint } | null {
  const startIndex = doc.blocks.findIndex((block) => block.id === start.id)
  const endIndex = doc.blocks.findIndex((block) => block.id === end.id)
  if (startIndex < 0 || endIndex < 0) return null
  if (startIndex < endIndex || (startIndex === endIndex && start.offset <= end.offset)) {
    return { start, end }
  }
  return { start: end, end: start }
}

export function deleteRange(
  doc: EditorDocument,
  start: EditorPoint,
  end: EditorPoint,
): EditorCaret {
  const ordered = orderRange(doc, start, end)
  if (!ordered) return { document: doc, caret: start }
  const from = ordered.start
  const to = ordered.end
  if (from.id === to.id) {
    const block = findBlock(doc, from.id)
    if (!block) return { document: doc, caret: start }
    return {
      document: updateBlock(doc, from.id, editText(block, from.offset, to.offset, '')),
      caret: { id: from.id, offset: Math.min(from.offset, to.offset) },
    }
  }
  const startIndex = doc.blocks.findIndex((block) => block.id === from.id)
  const endIndex = doc.blocks.findIndex((block) => block.id === to.id)
  const left = doc.blocks[startIndex]
  const right = doc.blocks[endIndex]
  if (!left || !right) return { document: doc, caret: start }
  const keptLeft = editText(left, from.offset, blockText(left).length, '')
  const keptRight = editText(right, 0, to.offset, '')
  const merged = mergeBlocks(keptLeft, keptRight)
  return {
    document: {
      blocks: [...doc.blocks.slice(0, startIndex), merged, ...doc.blocks.slice(endIndex + 1)],
    },
    caret: { id: merged.id, offset: from.offset },
  }
}

export function pasteText(
  doc: EditorDocument,
  start: EditorPoint,
  end: EditorPoint,
  text: string,
  style: EditorStyle,
  nextId: () => string,
): EditorCaret {
  const cleared = deleteRange(doc, start, end)
  const block = findBlock(cleared.document, cleared.caret.id)
  if (!block) return cleared
  if (block.kind === 'divider') {
    const id = nextId()
    const next = insertAfter(cleared.document, block.id, emptyBlock(id))
    return pasteText(next, { id, offset: 0 }, { id, offset: 0 }, text, style, nextId)
  }
  if (block.kind === 'code' || block.kind === 'image' || !text.includes('\n')) {
    const next = editText(
      block,
      cleared.caret.offset,
      cleared.caret.offset,
      text,
      style.marks,
      style.href,
    )
    return {
      document: updateBlock(cleared.document, block.id, next),
      caret: { id: block.id, offset: cleared.caret.offset + text.length },
    }
  }
  const lines = text.split('\n')
  const first = lines[0] ?? ''
  const rest = lines.slice(1)
  const withFirst = editText(
    block,
    cleared.caret.offset,
    cleared.caret.offset,
    first,
    style.marks,
    style.href,
  )
  const [head, tail] = splitBlock(withFirst, cleared.caret.offset + first.length, nextId())
  const middle = rest
    .slice(0, -1)
    .map((line) => editText(emptyBlock(nextId(), head.kind), 0, 0, line, style.marks, style.href))
  const lastLine = rest[rest.length - 1] ?? ''
  const last = editText(tail, 0, 0, lastLine, style.marks, style.href)
  return {
    document: replaceBlock(cleared.document, block.id, [head, ...middle, last]),
    caret: { id: last.id, offset: lastLine.length },
  }
}

export function splitAt(doc: EditorDocument, point: EditorPoint, nextId: string): EditorCaret {
  const block = findBlock(doc, point.id)
  if (!block) return { document: doc, caret: point }
  if (block.kind === 'divider' || block.kind === 'image') {
    return {
      document: insertAfter(doc, block.id, emptyBlock(nextId)),
      caret: { id: nextId, offset: 0 },
    }
  }
  if (
    (block.kind === 'bullet' || block.kind === 'number' || block.kind === 'check') &&
    blockText(block).length === 0
  ) {
    const next = setBlockKind(block, 'paragraph')
    return { document: updateBlock(doc, block.id, next), caret: { id: block.id, offset: 0 } }
  }
  const [left, right] = splitBlock(block, point.offset, nextId)
  const opened =
    blockText(right).length === 0 && (right.kind === 'heading' || right.kind === 'quote')
      ? setBlockKind(right, 'paragraph')
      : right
  return {
    document: replaceBlock(doc, block.id, [left, opened]),
    caret: { id: opened.id, offset: 0 },
  }
}

export function mergeWith(doc: EditorDocument, id: string, direction: -1 | 1): EditorCaret {
  const index = doc.blocks.findIndex((block) => block.id === id)
  const block = doc.blocks[index]
  const other = doc.blocks[index + direction]
  if (index < 0 || !block || !other) return { document: doc, caret: { id, offset: 0 } }
  if (other.kind === 'divider') {
    return {
      document: { blocks: doc.blocks.filter((item) => item.id !== other.id) },
      caret: { id: block.id, offset: direction < 0 ? 0 : blockText(block).length },
    }
  }
  if (block.kind === 'divider') {
    return {
      document: { blocks: doc.blocks.filter((item) => item.id !== block.id) },
      caret: { id: other.id, offset: direction < 0 ? blockText(other).length : 0 },
    }
  }
  const left = direction < 0 ? other : block
  const right = direction < 0 ? block : other
  const merged = mergeBlocks(left, right)
  const start = Math.min(index, index + direction)
  return {
    document: {
      blocks: [...doc.blocks.slice(0, start), merged, ...doc.blocks.slice(start + 2)],
    },
    caret: { id: merged.id, offset: blockText(left).length },
  }
}

export function moveBlock(doc: EditorDocument, id: string, direction: -1 | 1): EditorDocument {
  const index = doc.blocks.findIndex((block) => block.id === id)
  const next = index + direction
  const current = doc.blocks[index]
  const other = doc.blocks[next]
  if (!current || !other || next < 0 || next >= doc.blocks.length) return doc
  const blocks = [...doc.blocks]
  blocks[index] = other
  blocks[next] = current
  return { blocks }
}

export function mapSelection(
  doc: EditorDocument,
  start: EditorPoint,
  end: EditorPoint,
  edit: (block: EditorBlock, from: number, to: number) => EditorBlock,
): EditorDocument {
  const ordered = orderRange(doc, start, end)
  if (!ordered) return doc
  const startIndex = doc.blocks.findIndex((block) => block.id === ordered.start.id)
  const endIndex = doc.blocks.findIndex((block) => block.id === ordered.end.id)
  return {
    blocks: doc.blocks.map((block, index) => {
      if (index < startIndex || index > endIndex) return block
      const from = index === startIndex ? ordered.start.offset : 0
      const to = index === endIndex ? ordered.end.offset : blockText(block).length
      if (from === to) return block
      return edit(block, from, to)
    }),
  }
}

export function selectedText(doc: EditorDocument, start: EditorPoint, end: EditorPoint): string {
  const ordered = orderRange(doc, start, end)
  if (!ordered) return ''
  const startIndex = doc.blocks.findIndex((block) => block.id === ordered.start.id)
  const endIndex = doc.blocks.findIndex((block) => block.id === ordered.end.id)
  const parts: string[] = []
  for (let index = startIndex; index <= endIndex; index += 1) {
    const block = doc.blocks[index]
    if (!block) continue
    const text = blockText(block)
    const from = index === startIndex ? ordered.start.offset : 0
    const to = index === endIndex ? ordered.end.offset : text.length
    parts.push(text.slice(from, to))
  }
  return parts.join('\n')
}

export function shiftOffset(
  text: string,
  offset: number,
  unit: 'char' | 'word' | 'line',
  direction: -1 | 1,
): number {
  const at = clamp(offset, 0, text.length)
  if (direction < 0) {
    if (unit === 'char') return previousChar(text, at)
    if (unit === 'line') {
      const line = text.lastIndexOf('\n', at - 1)
      return line < 0 ? 0 : line
    }
    let index = at
    while (index > 0 && isSpace(text[index - 1])) index -= 1
    while (index > 0 && !isSpace(text[index - 1])) index -= 1
    return index
  }
  if (unit === 'char') return nextChar(text, at)
  if (unit === 'line') {
    const line = text.indexOf('\n', at)
    return line < 0 ? text.length : line + 1
  }
  let index = at
  while (index < text.length && !isSpace(text[index])) index += 1
  while (index < text.length && isSpace(text[index])) index += 1
  return index
}

export function reconcileText(
  block: EditorBlock,
  nextText: string,
  style: EditorStyle,
): EditorBlock {
  const previous = blockText(block)
  if (previous === nextText) return block
  let start = 0
  while (
    start < previous.length &&
    start < nextText.length &&
    previous[start] === nextText[start]
  ) {
    start += 1
  }
  let previousEnd = previous.length
  let nextEnd = nextText.length
  while (
    previousEnd > start &&
    nextEnd > start &&
    previous[previousEnd - 1] === nextText[nextEnd - 1]
  ) {
    previousEnd -= 1
    nextEnd -= 1
  }
  return editText(
    block,
    start,
    previousEnd,
    nextText.slice(start, nextEnd),
    style.marks,
    style.href,
  )
}

function sameBlock(left: EditorBlock | undefined, right: EditorBlock | undefined): boolean {
  if (!left || !right) return false
  if (left.id !== right.id || left.kind !== right.kind || left.level !== right.level) return false
  if ((left.align ?? 'start') !== (right.align ?? 'start')) return false
  if ((left.checked === true) !== (right.checked === true)) return false
  if ((left.src ?? '') !== (right.src ?? '')) return false
  if ((left.alt ?? '') !== (right.alt ?? '')) return false
  if (left.runs.length !== right.runs.length) return false
  return left.runs.every((run, index) => sameRun(run, right.runs[index]))
}

function copyBlock(block: EditorBlock): EditorBlock {
  const align = block.align === 'center' || block.align === 'end' ? block.align : undefined
  return {
    id: block.id,
    kind: block.kind,
    level: block.kind === 'heading' ? block.level : 1,
    runs: block.kind === 'divider' ? [] : block.runs,
    ...(align ? { align } : {}),
    ...(block.kind === 'check' ? { checked: block.checked === true } : {}),
    ...(block.kind === 'image' && block.src
      ? { src: block.src, ...(block.alt ? { alt: block.alt } : {}) }
      : {}),
  }
}

function sameRun(left: EditorRun | undefined, right: EditorRun | undefined): boolean {
  if (!left || !right) return false
  return left.text === right.text && left.href === right.href && sameMarks(left.marks, right.marks)
}

function sameMarks(left: readonly EditorMark[], right: readonly EditorMark[]): boolean {
  const a = canonMarks(left)
  const b = canonMarks(right)
  return a.length === b.length && a.every((mark, index) => mark === b[index])
}

function sameStyle(left: EditorRun, right: EditorRun): boolean {
  return left.href === right.href && sameMarks(left.marks, right.marks)
}

function takeBefore(runs: readonly EditorRun[], offset: number): EditorRun[] {
  const cut: EditorRun[] = []
  let cursor = 0
  for (const run of runs) {
    if (cursor >= offset) break
    const take = Math.min(run.text.length, offset - cursor)
    if (take > 0) cut.push(sliceRun(run, 0, take))
    cursor += run.text.length
  }
  return cut
}

function takeAfter(runs: readonly EditorRun[], offset: number): EditorRun[] {
  const cut: EditorRun[] = []
  let cursor = 0
  for (const run of runs) {
    const end = cursor + run.text.length
    if (end > offset) {
      const skip = Math.max(0, offset - cursor)
      const text = run.text.slice(skip)
      if (text.length > 0) cut.push({ ...sliceRun(run, 0, run.text.length), text })
    }
    cursor = end
  }
  return cut
}

function middleRuns(runs: readonly EditorRun[], start: number, end: number): EditorRun[] {
  return takeAfter(takeBefore(runs, Math.max(start, end)), Math.min(start, end))
}

function mapMiddle(
  block: EditorBlock,
  start: number,
  end: number,
  edit: (run: EditorRun) => EditorRun,
): EditorBlock {
  return {
    ...block,
    runs: normalizeRuns([
      ...takeBefore(block.runs, start),
      ...middleRuns(block.runs, start, end).map(edit),
      ...takeAfter(block.runs, end),
    ]),
  }
}

function runCovering(runs: readonly EditorRun[], offset: number): EditorRun | null {
  let cursor = 0
  for (const run of runs) {
    const end = cursor + run.text.length
    if (offset < end) return run
    cursor = end
  }
  return runs[runs.length - 1] ?? null
}

function sliceRun(run: EditorRun, start: number, end: number): EditorRun {
  return {
    text: run.text.slice(start, end),
    marks: canonMarks(run.marks),
    ...(run.href ? { href: run.href } : {}),
  }
}

function previousChar(text: string, offset: number): number {
  if (offset <= 0) return 0
  const code = text.charCodeAt(offset - 1)
  if (code >= 0xdc00 && code <= 0xdfff && offset >= 2) return offset - 2
  return offset - 1
}

function nextChar(text: string, offset: number): number {
  if (offset >= text.length) return text.length
  const code = text.charCodeAt(offset)
  if (code >= 0xd800 && code <= 0xdbff && offset + 1 < text.length) return offset + 2
  return offset + 1
}

function isSpace(value: string | undefined): boolean {
  return value !== undefined && /\s/u.test(value)
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}
