import preview from '@sb/preview'
import { UiField } from '@/components/field'
import { UiInput } from '@/components/input'
import { UiSearch } from '@/components/search'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Search',
  component: UiSearch,
  args: { label: 'Search clients' },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiField, UiInput, UiSearch },
      setup: () => ({ args }),
      template: `<ui-search v-bind="args"><ui-field label="Search clients"><ui-input type="search" placeholder="Client name" /></ui-field></ui-search>`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiField, UiInput, UiSearch, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Native role" note="The landmark is a form, so Vue does not look for a search component.">
          <ui-search label="Search clients"><ui-field label="Search clients"><ui-input type="search" placeholder="Client name" /></ui-field></ui-search>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
