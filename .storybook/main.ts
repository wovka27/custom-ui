import type { StorybookConfig } from '@storybook/vue3-vite'

const config = {
  stories: ['../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: {
        plugin: 'vue-component-meta',
        tsconfig: 'tsconfig.docgen.json',
      },
    },
  },
  docs: {
    defaultName: 'Docs',
  },
  typescript: {
    check: false,
  },
} satisfies StorybookConfig

export default config
