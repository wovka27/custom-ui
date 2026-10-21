import { ref } from 'vue'
import preview from '@sb/preview'
import { UiPagination } from '@/components/pagination'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Navigation/Pagination',
  component: UiPagination,
  args: {
    page: 4,
    pageCount: 10,
    label: 'Invoice pages',
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiPagination },
      setup() {
        const page = ref(Number(args.page ?? 1))
        return { args, page }
      },
      template: '<UiPagination v-bind="args" v-model:page="page" />',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiPagination, ShowcaseBoard, ShowcaseCase },
    setup() {
      const early = ref(1)
      const middle = ref(4)
      const last = ref(10)
      const page = ref(1)
      const pageSize = ref(20)
      return { early, middle, last, page, pageSize }
    },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="First pages" note="1 and 2 stay together.">
        <UiPagination v-model:page="early" :page-count="10" label="First pages" />
      </ShowcaseCase>
      <ShowcaseCase title="Gap" note="First page, ellipsis, then the previous and current page.">
        <UiPagination v-model:page="middle" :page-count="10" label="Middle pages" />
      </ShowcaseCase>
      <ShowcaseCase title="Last page">
        <UiPagination v-model:page="last" :page-count="10" label="Last pages" />
      </ShowcaseCase>
      <ShowcaseCase title="Page size" note="The squares stay 28px. The row count is a select of the same height.">
        <UiPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="8"
          :page-sizes="[10, 20, 50]"
          label="Sized pages"
        />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
