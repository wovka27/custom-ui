<script setup lang="ts">
import { ref } from 'vue'
import type { CalendarEvent, EditorDocument, UiMenuItem } from '@/index'
import {
  emptyDocument,
  UiBackTop,
  UiCalendar,
  UiCarousel,
  UiCollapse,
  UiCollapseItem,
  UiCountdown,
  UiEditor,
  UiMenu,
  UiPagination,
  UiStack,
  UiSteps,
  UiTabs,
  UiTree,
} from '@/index'

const { name } = defineProps<{ name: string }>()

const day = ref('2026-10-24')
const events = ref<CalendarEvent[]>([
  {
    id: 'watch',
    title: 'Night watch',
    start: '2026-10-24T18:00',
    end: '2026-10-24T20:00',
  },
])
const endsAt = Date.now() + 120_000
const note = ref<EditorDocument>(emptyDocument('site-note'))
const picked = ref('None')
const page = ref(1)
const tab = ref('one')
const selected = ref<string | null>('invoices')
const menu: UiMenuItem[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'archive', label: 'Archive', danger: true },
]
const steps = [
  { id: 'draft', title: 'Draft', description: 'Write the brief' },
  { id: 'review', title: 'Review', description: 'A second pair of eyes' },
  { id: 'file', title: 'File', description: 'Send it out' },
]
const tabs = [
  { id: 'one', label: 'Draft' },
  { id: 'two', label: 'Filed' },
]
const nodes = [
  {
    id: 'desk',
    label: 'Desk',
    children: [
      { id: 'invoices', label: 'Invoices' },
      { id: 'briefs', label: 'Briefs' },
    ],
  },
  { id: 'archive', label: 'Archive' },
]

function onCreate(event: CalendarEvent): void {
  events.value = [...events.value, event]
}

function onUpdate(event: CalendarEvent): void {
  events.value = events.value.map((item) => (item.id === event.id ? event : item))
}

function onRemove(id: string): void {
  events.value = events.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div v-if="name === 'UiBackTop'">
    <p>Scroll the page. The control appears after the threshold.</p>
    <ui-back-top />
  </div>

  <ui-calendar
    v-else-if="name === 'UiCalendar'"
    v-model="day"
    :events="events"
    label="Desk"
    @create="onCreate"
    @update="onUpdate"
    @remove="onRemove"
  />

  <ui-carousel v-else-if="name === 'UiCarousel'" label="Slides" pagination="dots">
    <article class="slide">One</article>
    <article class="slide">Two</article>
    <article class="slide">Three</article>
  </ui-carousel>

  <ui-collapse v-else-if="name === 'UiCollapse' || name === 'UiCollapseItem'" :default-value="['one']">
    <ui-collapse-item name="one" title="Schedule">The desk opens at nine.</ui-collapse-item>
    <ui-collapse-item name="two" title="Crew">Ada, Lin, and Mio.</ui-collapse-item>
  </ui-collapse>

  <p v-else-if="name === 'UiCountdown'">
    Closes in <ui-countdown :ends-at="endsAt" label="Filing window" />.
  </p>

  <ui-editor v-else-if="name === 'UiEditor'" v-model="note" label="Desk note" />

  <ui-stack v-else-if="name === 'UiMenu'" gap="sm">
    <ui-menu :items="menu" label="More" @select="picked = $event.label" />
    <p role="status">{{ picked }}</p>
  </ui-stack>

  <ui-pagination v-else-if="name === 'UiPagination'" v-model:page="page" :page-count="8" label="Pages" />

  <ui-steps v-else-if="name === 'UiSteps'" :items="steps" :current="1" />

  <ui-tabs v-else-if="name === 'UiTabs'" v-model="tab" label="Notes" :tabs="tabs">
    <template #one>The brief is still a draft.</template>
    <template #two>The brief has been filed.</template>
  </ui-tabs>

  <ui-tree
    v-else-if="name === 'UiTree'"
    v-model:selected="selected"
    :nodes="nodes"
    label="Files"
    :default-expanded="['desk']"
  />
</template>

<style scoped lang="scss">
p {
  margin: 0;
}

.slide {
  display: grid;
  min-height: 8rem;
  place-items: center;
  background: var(--ui-color-subtle);
}
</style>
