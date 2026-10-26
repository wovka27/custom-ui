import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiPopover } from '@/components/popover'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Overlay/Popover',
  component: UiPopover,
  args: {
    placement: 'bottom',
    align: 'center',
    trigger: 'click',
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'start', 'end'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    trigger: { control: 'inline-radio', options: ['click', 'hover'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiPopover, UiButton },
      setup: () => ({ args }),
      template: `
        <div style="padding: 4rem">
          <ui-popover :placement="args.placement" :align="args.align" :trigger="args.trigger">
            <template #trigger="{ open }">
              <ui-button :aria-expanded="open">Open</UiButton>
            </template>
            The panel sits on the chosen side of this button.
          </ui-popover>
        </div>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiPopover, UiButton, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Sides" note="placement picks the side. align shifts the panel along that edge.">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;padding:3rem 1rem">
            <ui-popover placement="top" align="center">
              <template #trigger="{ open }"><ui-button :aria-expanded="open">Top</UiButton></template>
              Above the trigger.
            </ui-popover>
            <ui-popover placement="bottom" align="center">
              <template #trigger="{ open }"><ui-button :aria-expanded="open">Bottom</UiButton></template>
              Under the trigger.
            </ui-popover>
            <ui-popover placement="start" align="center">
              <template #trigger="{ open }"><ui-button :aria-expanded="open">Start</UiButton></template>
              Before the trigger.
            </ui-popover>
            <ui-popover placement="end" align="center">
              <template #trigger="{ open }"><ui-button :aria-expanded="open">End</UiButton></template>
              After the trigger.
            </ui-popover>
          </div>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
