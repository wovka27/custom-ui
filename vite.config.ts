import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    ...(command === 'build'
      ? [
          dts({
            entryRoot: 'src',
            include: ['src'],
            exclude: [
              'src/site',
              'src/stories',
              'src/**/*.spec.ts',
              'src/**/*.stories.ts',
            ],
            tsconfigPath: './tsconfig.json',
            insertTypesEntry: true,
            cleanVueFileName: true,
            compilerOptions: {
              types: ['vite/client'],
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@sb': fileURLToPath(new URL('./.storybook', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'CustomUi',
      fileName: 'custom-ui',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
  },
}))
