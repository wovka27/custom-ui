import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiTooltip } from '@/components/tooltip'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Tooltip',
  component: UiTooltip,
  args: { placement: 'top', align: 'center', content: 'Saves the current draft' },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'start', 'end'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiTooltip, UiButton },
      setup: () => ({ args }),
      template: `
        <div style="padding: 4rem">
          <ui-tooltip :content="args.content" :placement="args.placement" :align="args.align">
            <template #default="{ describedBy }">
              <ui-button :aria-describedby="describedBy">Save</UiButton>
            </template>
          </ui-tooltip>
        </div>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTooltip, UiButton, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Sides">
          <div style="display:flex;flex-wrap:wrap;gap:3rem;padding:3rem 1rem">
            <ui-tooltip content="Above" placement="top">
              <template #default="{ describedBy }"><ui-button variant="ghost" :aria-describedby="describedBy">Top</UiButton></template>
            </ui-tooltip>
            <ui-tooltip content="Under" placement="bottom">
              <template #default="{ describedBy }"><ui-button variant="ghost" :aria-describedby="describedBy">Bottom</UiButton></template>
            </ui-tooltip>
            <ui-tooltip content="Before" placement="start">
              <template #default="{ describedBy }"><ui-button variant="ghost" :aria-describedby="describedBy">Start</UiButton></template>
            </ui-tooltip>
            <ui-tooltip content="After" placement="end">
              <template #default="{ describedBy }"><ui-button variant="ghost" :aria-describedby="describedBy">End</UiButton></template>
            </ui-tooltip>
          </div>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
