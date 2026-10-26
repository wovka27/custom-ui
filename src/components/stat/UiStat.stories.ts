import preview from '@sb/preview'
import { UiStat } from '@/components/stat'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Data/Stat',
  component: UiStat,
  args: { label: 'Open invoices', value: '18', hint: '+3 this week', tone: 'success' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiStat, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Row">
          <ui-stat label="Open" value="18" hint="+3" tone="success" />
          <ui-stat label="Overdue" value="2" hint="−1" tone="danger" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
