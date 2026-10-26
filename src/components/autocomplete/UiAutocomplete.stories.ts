import preview from '@sb/preview'
import { UiAutocomplete } from '@/components/autocomplete'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const options = [
  { value: 'north', label: 'North dock' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio One' },
]

const meta = preview.meta({
  title: 'Controls/Autocomplete',
  component: UiAutocomplete,
  args: { label: 'Client', placeholder: 'Find a client', options, defaultValue: '' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiAutocomplete, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ options }),
    template: `<showcase-board><showcase-case title="Clients"><ui-autocomplete label="Client" placeholder="Find a client" :options="options" /></showcase-case></showcase-board>`,
  })),
)
