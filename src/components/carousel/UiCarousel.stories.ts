import preview from '@sb/preview'
import { UiCarousel } from '@/components/carousel'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const slides = `
  <article style="display:grid;place-items:center">One</article>
  <article style="display:grid;place-items:center">Two</article>
  <article style="display:grid;place-items:center">Three</article>
`

const meta = preview.meta({
  title: 'Navigation/Carousel',
  component: UiCarousel,
  args: {
    label: 'Frames',
    controls: 'inside',
    loop: false,
    pagination: 'dots',
    paginationTrigger: 'click',
  },
  argTypes: {
    controls: { control: 'inline-radio', options: ['inside', 'top', 'bottom', 'none'] },
    pagination: { control: 'inline-radio', options: ['dots', 'line', 'none'] },
    paginationTrigger: { control: 'inline-radio', options: ['click', 'hover'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiCarousel },
      setup: () => ({ args }),
      template: `
        <ui-carousel :label="args.label" :controls="args.controls" :loop="args.loop" :pagination="args.pagination" :pagination-trigger="args.paginationTrigger" style="width: 20rem">
          ${slides}
        </ui-carousel>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCarousel, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Dots" note="Click a dot. The pages stay at the bottom of the frame.">
          <ui-carousel label="Frames" pagination="dots" pagination-trigger="click" style="width: 20rem">${slides}</ui-carousel>
        </showcase-case>
        <showcase-case title="Line" note="Hover a line to change the slide.">
          <ui-carousel label="Frames" pagination="line" pagination-trigger="hover" controls="top" style="width: 20rem">${slides}</ui-carousel>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
