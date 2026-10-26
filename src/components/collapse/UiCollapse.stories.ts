import preview from '@sb/preview'
import { UiCollapse, UiCollapseItem } from '@/components/collapse'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const board = {
  components: { UiCollapse, UiCollapseItem },
  template: `
    <ui-collapse :default-value="['one']" style="width: 22rem">
      <ui-collapse-item name="one" title="Schedule">The desk opens at nine.</ui-collapse-item>
      <ui-collapse-item name="two" title="Crew">Ada, Lin, and Mio.</ui-collapse-item>
    </ui-collapse>
  `,
}

const meta = preview.meta({ title: 'Navigation/Collapse', component: UiCollapse })

export const Playground = meta.story(playground({ render: () => board }))

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCollapse, UiCollapseItem, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Single">
          <ui-collapse :default-value="['one']" style="width: 22rem">
            <ui-collapse-item name="one" title="Schedule">The desk opens at nine.</ui-collapse-item>
            <ui-collapse-item name="two" title="Crew">Ada, Lin, and Mio.</ui-collapse-item>
          </ui-collapse>
        </showcase-case>
        <showcase-case title="Multiple">
          <ui-collapse multiple :default-value="['a']" style="width: 22rem">
            <ui-collapse-item name="a" title="Notes">Both panels can stay open.</ui-collapse-item>
            <ui-collapse-item name="b" title="Archive">Older work lives here.</ui-collapse-item>
          </ui-collapse>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
