import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiDialog } from '@/components/dialog'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Dialog',
  component: UiDialog,
  args: {
    title: 'Archive this workspace?',
    description: 'Members keep read access. You can restore it later.',
    size: 'md',
    persistent: false,
    open: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiButton, UiDialog },
      setup() {
        const open = ref(false)
        return { args, open }
      },
      template: `
      <UiButton @click="open = true">Open dialog</UiButton>
      <UiDialog v-bind="args" v-model:open="open">
        Nothing is deleted. The workspace leaves the active list.
        <template #footer="{ close }">
          <UiButton variant="secondary" @click="close">Cancel</UiButton>
          <UiButton variant="danger" @click="open = false">Archive</UiButton>
        </template>
      </UiDialog>
    `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiDialog, ShowcaseBoard, ShowcaseCase },
    setup() {
      const open = ref(false)
      const first = ref(false)
      const second = ref(false)
      const stackStatus = ref('')
      function wait(ms: number): Promise<void> {
        return new Promise((resolve) => {
          window.setTimeout(resolve, ms)
        })
      }
      async function closeSecond(): Promise<boolean> {
        stackStatus.value = 'Waiting to close the top dialog…'
        await wait(400)
        stackStatus.value = 'Top dialog closed.'
        return true
      }
      async function closeFirst(): Promise<boolean> {
        stackStatus.value = 'Waiting to close the lower dialog…'
        await wait(400)
        stackStatus.value = 'Lower dialog closed.'
        return true
      }
      function closeBoth(): void {
        second.value = false
        first.value = false
      }
      return { open, first, second, stackStatus, closeFirst, closeSecond, closeBoth }
    },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Confirm" note="Cancel closes. Archive is the destructive action.">
        <UiButton @click="open = true">Archive workspace</UiButton>
        <UiDialog v-model:open="open" title="Archive this workspace?" description="Members keep read access.">
          Nothing is deleted.
          <template #footer="{ close }">
            <UiButton variant="secondary" @click="close">Cancel</UiButton>
            <UiButton variant="danger" @click="open = false">Archive</UiButton>
          </template>
        </UiDialog>
      </ShowcaseCase>
      <ShowcaseCase title="Stack" note="The top dialog finishes its wait before the one under it can close.">
        <UiButton @click="first = true">Open the first dialog</UiButton>
        <p role="status">{{ stackStatus }}</p>
        <UiDialog v-model:open="first" title="First dialog" description="Open the next dialog from here." :before-close="closeFirst">
          The second dialog sits above this one.
          <template #footer="{ closing }">
            <UiButton :disabled="closing" @click="second = true">Open the next</UiButton>
          </template>
        </UiDialog>
        <UiDialog v-model:open="second" title="Second dialog" description="Closing waits, then the first dialog waits." :before-close="closeSecond">
          Discard both closes this dialog, then the one underneath.
          <template #footer="{ close, closing }">
            <UiButton variant="secondary" :disabled="closing" @click="close">Close this one</UiButton>
            <UiButton :loading="closing" @click="closeBoth">Discard both</UiButton>
          </template>
        </UiDialog>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
