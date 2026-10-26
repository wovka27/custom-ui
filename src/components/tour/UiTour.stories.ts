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
          <ui-button id="tour-save" @click="open = true">Save</UiButton>
          <ui-button id="tour-share" variant="secondary">Share</UiButton>
        </div>
        <ui-tour v-model="open" :steps="steps" />
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTour, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ open: ref(false), steps }),
    template: `
      <showcase-board>
        <showcase-case title="Two steps">
          <div style="display:flex;gap:1rem">
            <ui-button id="tour-save" @click="open = true">Start</UiButton>
            <ui-button id="tour-share" variant="secondary">Share</UiButton>
          </div>
          <ui-tour v-model="open" :steps="steps" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
