import preview from '@sb/preview'
import { UiQrCode } from '@/components/qr-code'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/QrCode',
  component: UiQrCode,
  args: {
    value: 'berth:desk/18',
    label: 'Berth desk',
    level: 'M',
    shape: 'square',
    tone: 'neutral',
    size: 160,
    quiet: 4,
  },
  argTypes: {
    level: { control: 'select', options: ['L', 'M', 'Q', 'H'] },
    shape: { control: 'select', options: ['square', 'rounded', 'dot', 'diamond'] },
    tone: {
      control: 'select',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiQrCode, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Square">
          <ui-qr-code value="berth:desk/18" label="Berth desk" />
        </showcase-case>
        <showcase-case title="Rounded">
          <ui-qr-code value="berth:desk/18" label="Rounded modules" shape="rounded" />
        </showcase-case>
        <showcase-case title="Dots">
          <ui-qr-code value="berth:desk/18" label="Night gate" shape="dot" tone="accent" />
        </showcase-case>
        <showcase-case title="Diamond">
          <ui-qr-code value="berth:desk/18" label="Diamond modules" shape="diamond" tone="info" />
        </showcase-case>
        <showcase-case title="With a mark">
          <ui-qr-code value="berth:desk/18" label="Marked" shape="rounded" level="H">
            <template #mark>B</template>
          </ui-qr-code>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
