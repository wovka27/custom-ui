<script setup lang="ts">
import { ref } from 'vue'
import {
  UiAnchor,
  UiAvatar,
  UiBreadcrumb,
  UiButton,
  UiCloseButton,
  UiCode,
  UiCopy,
  UiKbd,
  UiLink,
  UiNav,
  UiQuote,
  UiStack,
  UiText,
  UiVisuallyHidden,
} from '@/index'

const { name } = defineProps<{ name: string }>()
const closed = ref(false)

const crumbs = [
  { id: 'desk', label: 'Desk', href: '#/component' },
  { id: 'brief', label: 'Brief' },
]
const nav = [
  { id: 'home', label: 'Home', href: '#/', current: true },
  { id: 'guide', label: 'Guide', href: '#/guide/installation' },
]
const anchors = [
  { id: 'anchor-first', title: 'First' },
  { id: 'anchor-second', title: 'Second' },
]
</script>

<template>
  <div v-if="name === 'UiAnchor'" class="split">
    <ui-anchor :items="anchors" label="On this page" />
    <div>
      <h3 id="anchor-first">First</h3>
      <p>The brief is on the desk.</p>
      <h3 id="anchor-second">Second</h3>
      <p>Three berths are open.</p>
    </div>
  </div>

  <ui-avatar v-else-if="name === 'UiAvatar'" name="Ada Lovelace" />

  <ui-breadcrumb v-else-if="name === 'UiBreadcrumb'" :items="crumbs" />

  <ui-stack v-else-if="name === 'UiCloseButton'" gap="sm">
    <ui-close-button label="Close the note" @click="closed = true" />
    <p v-if="closed" role="status">Closed.</p>
  </ui-stack>

  <ui-code v-else-if="name === 'UiCode'" block code="npm i @wovka-dev/custom-ui" />

  <ui-copy v-else-if="name === 'UiCopy'" value="INV-1042" label="Copy reference">Copy</ui-copy>

  <p v-else-if="name === 'UiKbd'">
    Press <ui-kbd>Ctrl</ui-kbd> <ui-kbd>K</ui-kbd>
  </p>

  <ui-link v-else-if="name === 'UiLink'" href="#/guide/installation">Installation</ui-link>

  <ui-nav v-else-if="name === 'UiNav'" label="Site" :items="nav" />

  <ui-quote v-else-if="name === 'UiQuote'" cite="North dock">Three berths are open tonight.</ui-quote>

  <ui-text v-else-if="name === 'UiText'" tone="muted" size="sm">A quiet line.</ui-text>

  <ui-button v-else-if="name === 'UiVisuallyHidden'" icon-only label="Close">
    <ui-visually-hidden>Close</ui-visually-hidden>
    ×
  </ui-button>
</template>

<style scoped lang="scss">
p,
h3 {
  margin: 0 0 var(--ui-space-3);
}

.split {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  gap: var(--ui-space-4);
}
</style>
