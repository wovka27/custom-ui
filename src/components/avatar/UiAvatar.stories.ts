import preview from '@sb/preview'
import { UiAvatar } from '@/components/avatar'
import { UiStatus } from '@/components/status'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Data/Avatar',
  component: UiAvatar,
  args: { name: 'Ada Lovelace', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiAvatar, UiStatus, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Initials">
          <ui-avatar name="Ada Lovelace" />
          <ui-avatar name="Grace" size="sm" />
          <ui-avatar name="Alan Turing" size="lg" />
        </showcase-case>
        <showcase-case title="Status" note="The badge slot sits on the frame.">
          <ui-avatar name="Ada Lovelace">
            <template #badge><ui-status tone="success" pulse label="" /></template>
          </ui-avatar>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
