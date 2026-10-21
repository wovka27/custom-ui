import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiNotification, showNotification } from '@/components/notification'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({ title: 'Feedback/Notification', component: UiNotification })

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiNotification, UiButton },
      setup: () => ({
        send: () =>
          showNotification({
            title: 'Build finished',
            description: 'The kit compiled.',
            tone: 'info',
          }),
      }),
      template: '<UiNotification /><UiButton @click="send">Notify</UiButton>',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiNotification, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => ({
      send: () =>
        showNotification({
          title: 'Upload failed',
          description: 'The file was rejected.',
          tone: 'danger',
        }),
      stack: () => {
        showNotification({ title: 'One', description: 'Slides in from the right.', tone: 'info' })
        showNotification({
          title: 'Two',
          description: 'The next notice sits under the first.',
          tone: 'success',
        })
        showNotification({
          title: 'Three',
          description: 'The pile grows downward.',
          tone: 'warning',
        })
      },
    }),
    template: `
      <UiNotification />
      <ShowcaseBoard>
        <ShowcaseCase title="From the right edge">
          <UiButton variant="danger" @click="send">Fail</UiButton>
        </ShowcaseCase>
        <ShowcaseCase title="Stack" note="Each new notice is added under the previous one.">
          <UiButton @click="stack">Three</UiButton>
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
