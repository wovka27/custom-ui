import preview from '@sb/preview'
import { UiAnchor } from '@/components/anchor'
import type { UiAnchorItem } from '@/components/anchor'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items: readonly UiAnchorItem[] = [
  { id: 'anchor-brief', title: 'Brief' },
  { id: 'anchor-proof', title: 'Proof' },
  { id: 'anchor-send', title: 'Send' },
]

const meta = preview.meta({
  title: 'Navigation/Anchor',
  component: UiAnchor,
  args: { items, label: 'On this page' },
  argTypes: { items: { control: false } },
})

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiAnchor },
      setup: () => ({ items }),
      template: `
        <div style="display:grid;grid-template-columns:9rem minmax(0,1fr);gap:1rem;height:16rem">
          <ui-anchor :items="items" />
          <div style="overflow:auto">
            <section id="anchor-brief" style="min-height:14rem"><h3>Brief</h3><p>The request.</p></section>
            <section id="anchor-proof" style="min-height:14rem"><h3>Proof</h3><p>The marked lines.</p></section>
            <section id="anchor-send" style="min-height:14rem"><h3>Send</h3><p>The client copy.</p></section>
          </div>
        </div>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiAnchor, ShowcaseBoard, ShowcaseCase },
    setup: () => ({
      items: [
        { id: 'anchor-case-brief', title: 'Brief' },
        { id: 'anchor-case-proof', title: 'Proof' },
        { id: 'anchor-case-send', title: 'Send' },
      ],
    }),
    template: `
      <showcase-board>
        <showcase-case title="In this page" note="The current section is marked as you scroll.">
          <div style="display:grid;grid-template-columns:9rem minmax(0,1fr);gap:1rem;height:16rem;width:100%">
            <ui-anchor :items="items" />
            <div style="overflow:auto">
              <section id="anchor-case-brief" style="min-height:14rem"><h3 style="margin:0">Brief</h3></section>
              <section id="anchor-case-proof" style="min-height:14rem"><h3 style="margin:0">Proof</h3></section>
              <section id="anchor-case-send" style="min-height:14rem"><h3 style="margin:0">Send</h3></section>
            </div>
          </div>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
