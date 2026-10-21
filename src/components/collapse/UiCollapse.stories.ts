import preview from '@sb/preview'
import { UiCollapse, UiCollapseItem } from '@/components/collapse'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const board = {
  components: { UiCollapse, UiCollapseItem },
  template: `
    <UiCollapse :default-value="['one']" style="width: 22rem">
      <UiCollapseItem name="one" title="Schedule">The desk opens at nine.</UiCollapseItem>
      <UiCollapseItem name="two" title="Crew">Ada, Lin, and Mio.</UiCollapseItem>
    </UiCollapse>
  `,
}

const meta = preview.meta({ title: 'Navigation/Collapse', component: UiCollapse })

export const Playground = meta.story(playground({ render: () => board }))

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCollapse, UiCollapseItem, ShowcaseBoard, ShowcaseCase },
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Single">
          <UiCollapse :default-value="['one']" style="width: 22rem">
            <UiCollapseItem name="one" title="Schedule">The desk opens at nine.</UiCollapseItem>
            <UiCollapseItem name="two" title="Crew">Ada, Lin, and Mio.</UiCollapseItem>
          </UiCollapse>
        </ShowcaseCase>
        <ShowcaseCase title="Multiple">
          <UiCollapse multiple :default-value="['a']" style="width: 22rem">
            <UiCollapseItem name="a" title="Notes">Both panels can stay open.</UiCollapseItem>
            <UiCollapseItem name="b" title="Archive">Older work lives here.</UiCollapseItem>
          </UiCollapse>
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
