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
          <UiPopover :placement="args.placement" :align="args.align" :trigger="args.trigger">
            <template #trigger="{ open }">
              <UiButton :aria-expanded="open">Open</UiButton>
            </template>
            The panel sits on the chosen side of this button.
          </UiPopover>
        </div>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiPopover, UiButton, ShowcaseBoard, ShowcaseCase },
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Sides" note="placement picks the side. align shifts the panel along that edge.">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;padding:3rem 1rem">
            <UiPopover placement="top" align="center">
              <template #trigger="{ open }"><UiButton :aria-expanded="open">Top</UiButton></template>
              Above the trigger.
            </UiPopover>
            <UiPopover placement="bottom" align="center">
              <template #trigger="{ open }"><UiButton :aria-expanded="open">Bottom</UiButton></template>
              Under the trigger.
            </UiPopover>
            <UiPopover placement="start" align="center">
              <template #trigger="{ open }"><UiButton :aria-expanded="open">Start</UiButton></template>
              Before the trigger.
            </UiPopover>
            <UiPopover placement="end" align="center">
              <template #trigger="{ open }"><UiButton :aria-expanded="open">End</UiButton></template>
              After the trigger.
            </UiPopover>
          </div>
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
