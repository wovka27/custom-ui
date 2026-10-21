import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { confirmBox, promptBox, UiMessageBox } from '@/components/message-box'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({ title: 'Feedback/Message box', component: UiMessageBox })

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiMessageBox, UiButton },
      setup: () => {
        const result = ref('Waiting')
        return {
          result,
          ask: () => {
            void confirmBox({
              title: 'Discard the draft?',
              description: 'This cannot be undone.',
              tone: 'danger',
            }).then((accepted) => {
              result.value = accepted ? 'Discarded' : 'Kept'
            })
          },
        }
      },
      template: '<UiMessageBox /><UiButton @click="ask">Ask</UiButton><p>{{ result }}</p>',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiMessageBox, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => {
      const result = ref('No answer yet')
      return {
        result,
        ask: () => {
          void promptBox({
            title: 'Name the desk',
            defaultValue: 'Harbor',
            confirmLabel: 'Save',
          }).then((value) => {
            result.value = value ?? 'Cancelled'
          })
        },
      }
    },
    template: `
      <UiMessageBox />
      <ShowcaseBoard>
        <ShowcaseCase title="Prompt">
          <UiButton @click="ask">Name</UiButton>
          <p>{{ result }}</p>
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
