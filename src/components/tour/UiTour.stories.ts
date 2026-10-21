import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiTour } from '@/components/tour'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const steps = [
  {
    id: 'save',
    title: 'Save',
    description: 'Keep the draft on this desk.',
    selector: '#tour-save',
  },
  {
    id: 'share',
    title: 'Share',
    description: 'Send it when the draft is ready.',
    selector: '#tour-share',
  },
]

const meta = preview.meta({ title: 'Feedback/Tour', component: UiTour })

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiTour, UiButton },
      setup: () => ({ open: ref(false), steps }),
      template: `
        <div style="display:flex;gap:1rem">
          <UiButton id="tour-save" @click="open = true">Save</UiButton>
          <UiButton id="tour-share" variant="secondary">Share</UiButton>
        </div>
        <UiTour v-model="open" :steps="steps" />
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTour, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ open: ref(false), steps }),
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Two steps">
          <div style="display:flex;gap:1rem">
            <UiButton id="tour-save" @click="open = true">Start</UiButton>
            <UiButton id="tour-share" variant="secondary">Share</UiButton>
          </div>
          <UiTour v-model="open" :steps="steps" />
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
