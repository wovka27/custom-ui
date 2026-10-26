import { describe, expect, it } from 'vitest'
import {
  blockShortcut,
  blockText,
  clearFormatting,
  countWords,
  deleteRange,
  editText,
  editorAsset,
  editorHref,
  marksAt,
  mergeWith,
  pasteText,
  setBlockAlign,
  setLink,
  splitAt,
  toggleMark,
  type EditorBlock,
  type EditorDocument,
} from './document'

function paragraph(
  id: string,
  text: string,
  marks: EditorBlock['runs'][number]['marks'] = [],
): EditorBlock {
  return { id, kind: 'paragraph', level: 1, runs: text.length === 0 ? [] : [{ text, marks }] }
}

function doc(blocks: EditorBlock[]): EditorDocument {
  return { blocks }
}

describe('editor document', () => {
  it('keeps a mark when text is typed inside it and toggles a slice', () => {
    const bold = editText(paragraph('a', 'Hello'), 5, 5, '!', ['bold'])
    expect(blockText(bold)).toBe('Hello!')
    expect(bold.runs).toEqual([
      { text: 'Hello', marks: [] },
      { text: '!', marks: ['bold'] },
    ])
    const marked = toggleMark(paragraph('a', 'Hello'), 1, 4, 'italic')
    expect(marked.runs.map((run) => run.text)).toEqual(['H', 'ell', 'o'])
    expect(marked.runs[1]?.marks).toEqual(['italic'])
    expect(toggleMark(marked, 1, 4, 'italic').runs).toEqual([{ text: 'Hello', marks: [] }])
    expect(marksAt(marked, 3).marks).toEqual(['italic'])
  })

  it('splits, merges, and deletes across blocks', () => {
    const source = doc([paragraph('a', 'Hello'), paragraph('b', 'world')])
    const removed = deleteRange(source, { id: 'a', offset: 3 }, { id: 'b', offset: 3 })
    expect(removed.document.blocks.map((block) => blockText(block))).toEqual(['Helld'])
    expect(removed.caret).toEqual({ id: 'a', offset: 3 })
    const split = splitAt(doc([paragraph('a', 'Hello')]), { id: 'a', offset: 2 }, 'b')
    expect(split.document.blocks.map((block) => blockText(block))).toEqual(['He', 'llo'])
    const merged = mergeWith(split.document, 'b', -1)
    expect(merged.document.blocks.map((block) => blockText(block))).toEqual(['Hello'])
    expect(merged.caret.offset).toBe(2)
  })

  it('pastes lines, exits an empty list, and opens a paragraph after a heading', () => {
    let serial = 0
    const pasted = pasteText(
      doc([paragraph('a', 'Hi')]),
      { id: 'a', offset: 2 },
      { id: 'a', offset: 2 },
      'one\ntwo',
      { marks: ['bold'] },
      () => `n${++serial}`,
    )
    expect(pasted.document.blocks.map((block) => blockText(block))).toEqual(['Hione', 'two'])
    expect(pasted.document.blocks[0]?.runs[0]?.marks).toEqual([])
    expect(pasted.document.blocks[0]?.runs[1]?.marks).toEqual(['bold'])
    const list = splitAt(
      doc([{ id: 'a', kind: 'bullet', level: 1, runs: [] }]),
      { id: 'a', offset: 0 },
      'b',
    )
    expect(list.document.blocks[0]?.kind).toBe('paragraph')
    const heading = splitAt(
      doc([{ id: 'a', kind: 'heading', level: 2, runs: [{ text: 'Title', marks: [] }] }]),
      { id: 'a', offset: 5 },
      'b',
    )
    expect(heading.document.blocks[1]?.kind).toBe('paragraph')
  })

  it('reads markdown shortcuts, counts words, and rejects unsafe links', () => {
    expect(blockShortcut(paragraph('a', '## Title'))?.kind).toBe('heading')
    expect(blockShortcut(paragraph('a', '## Title'))?.level).toBe(2)
    const listed = blockShortcut(paragraph('a', '- File it'))
    expect(listed ? blockText(listed) : '').toBe('File it')
    expect(blockShortcut(paragraph('a', '```'))?.kind).toBe('code')
    expect(countWords(doc([paragraph('a', 'File the brief')]))).toBe(3)
    expect(editorHref(' javascript:alert(1)')).toBeNull()
    expect(editorHref(' https://example.com ')).toBe('https://example.com')
    const linked = setLink(paragraph('a', 'brief'), 0, 5, 'https://example.com')
    expect(linked.runs[0]?.href).toBe('https://example.com')
    expect(clearFormatting(linked, 0, 5).runs).toEqual([{ text: 'brief', marks: [] }])
    expect(editorAsset('data:text/html;base64,abcd')).toBeNull()
    expect(editorAsset('data:image/png;base64,aaaa')).toBe('data:image/png;base64,aaaa')
    expect(blockShortcut(paragraph('a', '---'))?.kind).toBe('divider')
    const checked = blockShortcut({
      id: 'a',
      kind: 'bullet',
      level: 1,
      runs: [{ text: '[x] Filed', marks: [] }],
    })
    expect(checked?.kind).toBe('check')
    expect(checked?.checked).toBe(true)
    expect(checked ? blockText(checked) : '').toBe('Filed')
    const raised = toggleMark(toggleMark(paragraph('a', 'H2O'), 1, 2, 'sub'), 1, 2, 'sup')
    expect(raised.runs[1]?.marks).toEqual(['sup'])
    expect(setBlockAlign(paragraph('a', 'Hi'), 'center').align).toBe('center')
    const ruled = splitAt(
      doc([{ id: 'a', kind: 'divider', level: 1, runs: [] }]),
      { id: 'a', offset: 0 },
      'b',
    )
    expect(ruled.document.blocks.map((block) => block.kind)).toEqual(['divider', 'paragraph'])
    const joined = mergeWith(
      doc([{ id: 'a', kind: 'divider', level: 1, runs: [] }, paragraph('b', 'Hi')]),
      'b',
      -1,
    )
    expect(joined.document.blocks.map((block) => block.id)).toEqual(['b'])
    expect(blockText(editText(paragraph('a', 'Hi'), 2, 2, '😀'))).toBe('Hi😀')
  })
})
