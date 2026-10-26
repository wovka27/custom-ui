import { computed } from 'vue'
import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/vue3-vite'
import { UiConfigProvider } from '@/components/config'
import type { UiTheme } from '@/types/common'
import '@/styles/index.scss'
import '@/styles/utilities.css'
import './preview.css'

function themeOf(value: unknown): UiTheme {
  if (value === 'dark' || value === 'light' || value === 'system') return value
  return 'light'
}

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Controls', 'Feedback', 'Overlay', 'Navigation', 'Data', 'Layout', 'Utilities'],
      },
    },
  },
  decorators: [
    (story, context) => ({
      components: { UiConfigProvider, story },
      setup() {
        const theme = computed(() => themeOf(context.globals.theme))
        const fullscreen = computed(() => context.parameters.layout === 'fullscreen')
        return { theme, fullscreen }
      },
      template:
        '<ui-config-provider :theme="theme" class="sb-frame" :data-fullscreen="fullscreen || undefined"><story /></ui-config-provider>',
    }),
  ],
  tags: ['autodocs'],
})
