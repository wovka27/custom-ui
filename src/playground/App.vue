<script setup lang="ts">
import { ref } from 'vue'
import {
  UiAnchor,
  UiAppShell,
  UiButton,
  UiCluster,
  UiConfigProvider,
  UiStack,
  useTheme,
  type UiTheme,
} from '@/index'
import ControlsSection from './sections/ControlsSection.vue'
import DataSection from './sections/DataSection.vue'
import FeedbackSection from './sections/FeedbackSection.vue'
import FormsSection from './sections/FormsSection.vue'
import LayoutSection from './sections/LayoutSection.vue'

const { theme, setTheme } = useTheme()
const navOpen = ref(true)
const themes = ['light', 'dark', 'system'] as const satisfies readonly UiTheme[]

const links = [
  { href: '#forms', label: 'Forms' },
  { href: '#controls', label: 'Controls' },
  { href: '#feedback', label: 'Feedback' },
  { href: '#data', label: 'Data' },
  { href: '#layout', label: 'Layout' },
] as const
</script>

<template>
  <UiConfigProvider :theme="theme">
    <UiAppShell
      v-model:nav-open="navOpen"
      sidebar-label="Gallery"
      content-label="Component gallery"
    >
      <template #header>
        <div class="brand">
          <strong>Custom UI</strong>
          <span>Accessible Vue 3 kit</span>
        </div>
        <UiCluster gap="xs">
          <UiButton
            v-for="item in themes"
            :key="item"
            size="sm"
            :variant="theme === item ? 'primary' : 'secondary'"
            :aria-pressed="theme === item"
            @click="setTheme(item)"
          >
            {{ item }}
          </UiButton>
        </UiCluster>
      </template>
      <template #sidebar>
        <p class="meta">Components</p>
        <UiAnchor
          :items="links.map((link) => ({ id: link.href.slice(1), title: link.label }))"
          label="Gallery sections"
        />
      </template>
      <UiStack gap="xl">
        <FormsSection />
        <ControlsSection />
        <FeedbackSection />
        <DataSection />
        <LayoutSection />
      </UiStack>
      <template #footer>Custom UI Kit · Vue 3 · TypeScript</template>
    </UiAppShell>
  </UiConfigProvider>
</template>
