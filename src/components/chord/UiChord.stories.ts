import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiChord } from '@/components/chord'
import { ledgerScore } from '@/styles/score'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Chord',
  component: UiChord,
  args: { label: 'Chord', defaultValue: ledgerScore },
})

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiChord, UiButton },
      setup() {
        const score = ref(ledgerScore)
        return { score }
      },
      template: '<ui-chord v-model="score"><ui-button>Save</ui-button></ui-chord>',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiChord, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ ledgerScore }),
    template: `<showcase-board>
      <showcase-case title="Ledger"><ui-chord :default-value="ledgerScore"><ui-button>File</ui-button></ui-chord></showcase-case>
    </showcase-board>`,
  })),
)
