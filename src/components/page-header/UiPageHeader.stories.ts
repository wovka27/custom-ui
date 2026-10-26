import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiPageHeader } from '@/components/page-header'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Page header',
  component: UiPageHeader,
  args: { title: 'Invoices', description: 'Filed this week.' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiPageHeader, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Actions">
          <ui-page-header title="Invoices" description="Filed this week.">
            <template #eyebrow>Desk</template>
            <template #actions><ui-button size="sm">New invoice</UiButton></template>
          </ui-page-header>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
