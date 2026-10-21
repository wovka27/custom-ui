import { computed, ref } from 'vue'
import preview from '@sb/preview'
import { UiSelect } from '@/components/select'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'
import type { UiOption } from '@/types/common'

const roles: readonly UiOption<'editor' | 'producer' | 'admin'>[] = [
  { value: 'editor', label: 'Editor' },
  { value: 'producer', label: 'Producer' },
  { value: 'admin', label: 'Admin' },
]

const meta = preview.meta({
  title: 'Controls/Select',
  component: UiSelect,
  args: {
    options: roles,
    placeholder: 'Choose a role',
    allOption: false,
    disabled: false,
    invalid: false,
    size: 'md',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    allOption: { control: 'boolean' },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSelect, ShowcaseBoard, ShowcaseCase },
    setup: () => {
      const detailed: readonly UiOption<'ada' | 'lin'>[] = [
        { value: 'ada', label: 'Ada', hint: 'Editor' },
        { value: 'lin', label: 'Lin', hint: 'Producer' },
      ]
      const catalog = Array.from({ length: 40 }, (_, index) => ({
        value: `desk-${index + 1}`,
        label: `Desk ${index + 1}`,
      }))
      const page = ref(1)
      const loadingMore = ref(false)
      const visible = computed(() => catalog.slice(0, page.value * 8))
      const hasMore = computed(() => visible.value.length < catalog.length)
      function loadMore(): void {
        if (loadingMore.value || !hasMore.value) return
        loadingMore.value = true
        window.setTimeout(() => {
          page.value += 1
          loadingMore.value = false
        }, 500)
      }
      return { roles, detailed, visible, hasMore, loadingMore, loadMore }
    },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Placeholder">
        <UiSelect :options="roles" placeholder="Choose a role" />
      </ShowcaseCase>
      <ShowcaseCase title="All option" note="The first option submits null.">
        <UiSelect :options="roles" all-option :default-value="null" />
      </ShowcaseCase>
      <ShowcaseCase title="Custom all value">
        <UiSelect :options="roles" :all-option="{ label: 'Any role', value: null }" :default-value="null" />
      </ShowcaseCase>
      <ShowcaseCase title="Custom option" note="The option slot receives the option, selected, and active.">
        <UiSelect :options="detailed" placeholder="Choose a person">
          <template #option="{ option, selected }">
            <span>{{ option.label }}</span>
            <small v-if="option.hint">{{ selected ? 'Selected' : option.hint }}</small>
          </template>
        </UiSelect>
      </ShowcaseCase>
      <ShowcaseCase title="Paged options" note="The list asks for the next page when the end is visible.">
        <UiSelect
          :options="visible"
          :has-more="hasMore"
          :loading-more="loadingMore"
          placeholder="Choose a desk"
          @load-more="loadMore"
        />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
