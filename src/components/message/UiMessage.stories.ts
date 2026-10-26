import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiMessage, showMessage } from '@/components/message'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({ title: 'Feedback/Message', component: UiMessage })

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiMessage, UiButton },
      setup: () => ({
        send: () => showMessage({ description: 'Draft saved.', tone: 'success' }),
      }),
      template: '<ui-message /><ui-button @click="send">Show message</UiButton>',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiMessage, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => ({
      send: () =>
        showMessage({ title: 'Saved', description: 'The desk kept this draft.', tone: 'success' }),
    }),
    template: `
      <ui-message />
      <showcase-board>
        <showcase-case title="Transient">
          <ui-button @click="send">Save</UiButton>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
