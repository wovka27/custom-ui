<script setup lang="ts">
import { ref } from 'vue'
import {
  UiAffix,
  UiAppShell,
  UiAspectRatio,
  UiButton,
  UiCard,
  UiCluster,
  UiContainer,
  UiDivider,
  UiGrid,
  UiPageHeader,
  UiScrollArea,
  UiSeparator,
  UiSkeleton,
  UiStack,
  UiToolbar,
  UiWatermark,
} from '@/index'

const { name } = defineProps<{ name: string }>()
const navOpen = ref(true)
</script>

<template>
  <div v-if="name === 'UiAffix'">
    <ui-affix :offset="72">
      <ui-button size="sm">Pinned</ui-button>
    </ui-affix>
    <p>Scroll until the button reaches the header.</p>
  </div>

  <div v-else-if="name === 'UiAppShell'" class="frame">
    <ui-app-shell v-model:nav-open="navOpen" sidebar-label="Desk" content-label="Work">
      <template #header>Custom UI</template>
      <template #sidebar>Invoices</template>
      <p>The brief stays in the frame.</p>
      <template #footer>Night watch</template>
    </ui-app-shell>
  </div>

  <ui-aspect-ratio v-else-if="name === 'UiAspectRatio'" ratio="16 / 9">
    <div class="fill">16 / 9</div>
  </ui-aspect-ratio>

  <ui-card v-else-if="name === 'UiCard'" title="North dock" description="Three berths are open tonight.">
    The tide turns at dusk.
  </ui-card>

  <ui-cluster v-else-if="name === 'UiCluster'" gap="sm">
    <span class="swatch">One</span>
    <span class="swatch">Two</span>
    <span class="swatch">Three</span>
  </ui-cluster>

  <ui-container v-else-if="name === 'UiContainer'" width="20rem">
    <p class="swatch">The measure stops here.</p>
  </ui-container>

  <ui-divider v-else-if="name === 'UiDivider'">Or continue</ui-divider>

  <ui-grid v-else-if="name === 'UiGrid'" min-column="8rem">
    <p class="swatch">One</p>
    <p class="swatch">Two</p>
    <p class="swatch">Three</p>
  </ui-grid>

  <ui-page-header
    v-else-if="name === 'UiPageHeader'"
    title="Desk"
    description="Tonight's watch."
  >
    <template #actions>
      <ui-button size="sm">File</ui-button>
    </template>
  </ui-page-header>

  <ui-scroll-area v-else-if="name === 'UiScrollArea'" label="Notes" max-height="8rem">
    <p v-for="line in 8" :key="line">Line {{ line }}. The brief stays on the desk.</p>
  </ui-scroll-area>

  <ui-stack v-else-if="name === 'UiSeparator'" gap="sm">
    <p>Above</p>
    <ui-separator />
    <p>Below</p>
  </ui-stack>

  <ui-skeleton v-else-if="name === 'UiSkeleton'" :lines="3" />

  <ui-stack v-else-if="name === 'UiStack'" gap="sm">
    <p class="swatch">First</p>
    <p class="swatch">Second</p>
  </ui-stack>

  <ui-toolbar v-else-if="name === 'UiToolbar'" label="Tools">
    <ui-button size="sm">Edit</ui-button>
    <ui-button size="sm" variant="secondary">Share</ui-button>
    <template #end>
      <ui-button size="sm" variant="ghost">Close</ui-button>
    </template>
  </ui-toolbar>

  <ui-watermark v-else-if="name === 'UiWatermark'" text="Draft">
    <p class="swatch">The brief is not filed.</p>
  </ui-watermark>
</template>

<style scoped lang="scss">
p {
  margin: 0;
}

.swatch,
.fill {
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-bg);
}

.fill {
  height: 100%;
}

.frame {
  height: 22rem;
  overflow: hidden;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
}

.frame :deep(.ui-shell) {
  min-height: 0;
  height: 100%;
}
</style>
