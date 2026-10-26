import preview from '@sb/preview'
import { UiImage } from '@/components/image'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const src =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#123"/><text x="32" y="180" fill="#e8e8e8" font-size="32">Harbor</text></svg>',
  )

const meta = preview.meta({
  title: 'Data/Image',
  component: UiImage,
  args: { src, alt: 'Harbor', ratio: '16 / 9' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiImage, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ src }),
    template: `
      <showcase-board>
        <showcase-case title="Loaded"><ui-image :src="src" alt="Harbor" ratio="16 / 9" style="width: 16rem" /></showcase-case>
        <showcase-case title="Missing"><ui-image alt="No preview" style="width: 16rem" /></showcase-case>
      </showcase-board>
    `,
  })),
)
