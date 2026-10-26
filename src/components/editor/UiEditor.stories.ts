import preview from '@sb/preview'
import { UiEditor, type EditorDocument } from '@/components/editor'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const note: EditorDocument = {
  blocks: [
    {
      id: 'title',
      kind: 'heading',
      level: 2,
      runs: [{ text: 'Night note', marks: [] }],
    },
    {
      id: 'body',
      kind: 'paragraph',
      level: 1,
      runs: [
        { text: 'The brief ', marks: [] },
        { text: 'has a second pair of eyes', marks: ['italic'] },
        { text: '.', marks: [] },
      ],
    },
    {
      id: 'one',
      kind: 'bullet',
      level: 1,
      runs: [{ text: 'File it before dusk', marks: [] }],
    },
    {
      id: 'two',
      kind: 'bullet',
      level: 1,
      runs: [{ text: 'Ask which berth is free', marks: ['bold'] }],
    },
    { id: 'rule', kind: 'divider', level: 1, runs: [] },
    {
      id: 'done',
      kind: 'check',
      level: 1,
      checked: true,
      runs: [{ text: 'Berth is clear', marks: [] }],
    },
  ],
}

const meta = preview.meta({
  title: 'Controls/Editor',
  component: UiEditor,
  args: { label: 'Desk note', defaultValue: note },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiEditor, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ note }),
    template: `
      <showcase-board>
        <showcase-case title="Writing">
          <ui-editor label="Desk note" :default-value="note" />
        </showcase-case>
        <showcase-case title="Empty">
          <ui-editor label="Draft" placeholder="Start the brief" />
        </showcase-case>
        <showcase-case title="Read only">
          <ui-editor label="Filed" readonly :default-value="note" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
