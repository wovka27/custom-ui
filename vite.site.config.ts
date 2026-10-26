import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const siteBase = process.env.SITE_BASE
const base = siteBase !== undefined && siteBase.length > 0 ? siteBase : '/'

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@sb': fileURLToPath(new URL('./.storybook', import.meta.url)),
    },
  },
  build: {
    outDir: 'site-dist',
    emptyOutDir: true,
  },
})
