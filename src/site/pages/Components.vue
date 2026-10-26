<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue'
import { UiBreadcrumb, UiCode } from '@/index'
import {
  catalog,
  componentBySlug,
  componentCount,
  componentHref,
  componentTitle,
  findComponent,
  groupHref,
} from '../catalog'
import { docFor } from '../docs'
import Demo from '../examples/Demo.vue'
import LiveExample from '../examples/LiveExample.vue'
import ApiTable from '../frame/ApiTable.vue'
import CssVars from '../frame/CssVars.vue'
import PageFrame from '../frame/PageFrame.vue'
import { componentNeighbors } from '../nav'
import type { SiteLink } from '../nav'
import { referenceFor } from '../reference'

const { slug, group } = defineProps<{
  slug?: string
  group?: string
}>()

const name = computed(() => (slug === undefined ? undefined : componentBySlug(slug)))
const entry = computed(() => {
  const current = name.value
  if (current === undefined) return undefined
  const found = findComponent(current)
  if (found === undefined) return undefined
  return { name: current, group: found.group, doc: docFor(current) }
})

const neighbors = computed(() => {
  const current = name.value
  return current === undefined ? {} : componentNeighbors(current)
})

const crumbs = computed(() => {
  const current = entry.value
  if (current === undefined) return []
  return [
    { id: 'components', label: 'Components', href: '#/component' },
    { id: current.group.id, label: current.group.title, href: groupHref(current.group.id) },
    { id: current.name, label: componentTitle(current.name) },
  ]
})

const siblings = computed(() => {
  const current = entry.value
  if (current === undefined) return []
  return current.group.names.filter((item) => item !== current.name)
})

const api = computed(() => {
  const current = name.value
  return current === undefined ? undefined : referenceFor(current)
})

function exampleAnchor(title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `ex-${index}-${slug || 'case'}`
}

const toc = computed((): readonly SiteLink[] => {
  if (entry.value) {
    const links: SiteLink[] = [{ href: '#example', label: 'Basic usage' }]
    const info = api.value
    info?.examples.forEach((example, index) => {
      links.push({ href: `#${exampleAnchor(example.title, index)}`, label: example.title })
    })
    links.push({ href: '#usage', label: 'Usage' })
    if (info !== undefined && info.props.length > 0) links.push({ href: '#props', label: 'Props' })
    if (info !== undefined && info.events.length > 0)
      links.push({ href: '#events', label: 'Events' })
    if (info !== undefined && info.slots.length > 0) links.push({ href: '#slots', label: 'Slots' })
    if (info !== undefined && info.exposed.length > 0) {
      links.push({ href: '#exposes', label: 'Exposes' })
    }
    if (info !== undefined && info.variables.length > 0) {
      links.push({ href: '#css', label: 'CSS variables' })
    }
    if (siblings.value.length > 0) {
      links.push({ href: '#kin', label: `In ${entry.value.group.title}` })
    }
    return links
  }
  if (slug !== undefined) return []
  return catalog.map((item) => ({ href: `#group-${item.id}`, label: item.title }))
})

async function revealGroup(): Promise<void> {
  if (group === undefined || slug !== undefined) return
  await nextTick()
  document.getElementById(`group-${group}`)?.scrollIntoView()
}

onMounted(() => {
  void revealGroup()
})

watch(
  () => group,
  () => {
    void revealGroup()
  },
)
</script>

<template>
  <page-frame :toc="toc" :previous="neighbors.previous" :next="neighbors.next">
    <article v-if="slug !== undefined && entry === undefined" class="page">
      <h1>Not found</h1>
      <p>That component is not in this kit.</p>
      <a href="#/component">All components</a>
    </article>

    <article v-else-if="entry" :key="entry.name" class="page detail">
      <ui-breadcrumb :items="crumbs" />
      <h1>{{ componentTitle(entry.name) }}</h1>
      <p class="identity"><ui-code :code="entry.name" /></p>
      <p class="summary">{{ entry.doc.summary }}</p>
      <section id="example" class="demo" aria-labelledby="example-title">
        <header class="demo-bar">
          <h2 id="example-title">Basic usage</h2>
          <span>{{ entry.group.title }}</span>
        </header>
        <div class="demo-body">
          <demo :name="entry.name" />
        </div>
      </section>
      <section
        v-for="(example, index) in api?.examples ?? []"
        :key="exampleAnchor(example.title, index)"
        class="case"
      >
        <div v-if="example.live" class="demo">
          <header class="demo-bar">
            <h3 :id="exampleAnchor(example.title, index)">{{ example.title }}</h3>
            <span>Preview</span>
          </header>
          <p v-if="example.note" class="example-note">{{ example.note }}</p>
          <div class="demo-body">
            <live-example :source="example.render" />
          </div>
        </div>
        <h3 v-else :id="exampleAnchor(example.title, index)">{{ example.title }}</h3>
        <p v-if="!example.live && example.note" class="example-note standalone">
          {{ example.note }}
        </p>
        <div class="sample">
          <ui-code block :code="example.template" />
        </div>
      </section>
      <h2 id="usage">Usage</h2>
      <ui-code block :code="entry.doc.usage" />
      <section v-if="api && api.props.length > 0" id="props" aria-labelledby="props-title">
        <h2 id="props-title">Props</h2>
        <api-table :rows="api.props" defaults />
      </section>
      <section v-if="api && api.events.length > 0" id="events" aria-labelledby="events-title">
        <h2 id="events-title">Events</h2>
        <api-table :rows="api.events" />
      </section>
      <section v-if="api && api.slots.length > 0" id="slots" aria-labelledby="slots-title">
        <h2 id="slots-title">Slots</h2>
        <api-table :rows="api.slots" />
      </section>
      <section v-if="api && api.exposed.length > 0" id="exposes" aria-labelledby="exposes-title">
        <h2 id="exposes-title">Exposes</h2>
        <api-table :rows="api.exposed" />
      </section>
      <section v-if="api && api.variables.length > 0" id="css" aria-labelledby="css-title">
        <h2 id="css-title">CSS variables</h2>
        <p class="note">
          Customization is described in <a href="#/guide/theming">theming</a>. Replace one of these
          variables on an ancestor. This component reads it and does not declare it. A hook restyles
          this family. A foundation variable restyles every component that reads it.
        </p>
        <div v-if="api.css" class="sample">
          <ui-code block :code="api.css" />
        </div>
        <css-vars :rows="api.variables" />
      </section>
      <section v-if="siblings.length > 0" id="kin" class="kin" aria-labelledby="kin-title">
        <h2 id="kin-title">In {{ entry.group.title }}</h2>
        <ul>
          <li v-for="item in siblings" :key="item">
            <a :href="componentHref(item)">{{ componentTitle(item) }}</a>
          </li>
        </ul>
      </section>
    </article>

    <article v-else class="page">
      <h1>Components</h1>
      <p class="summary">{{ componentCount }} components. Pick a name, or use the menu.</p>
      <section v-for="item in catalog" :id="`group-${item.id}`" :key="item.id" class="family">
        <h2>
          <a :href="groupHref(item.id)">{{ item.title }}</a>
          <span>{{ item.names.length }}</span>
        </h2>
        <p class="note">{{ item.note }}</p>
        <ul>
          <li v-for="componentName in item.names" :key="componentName">
            <a :href="componentHref(componentName)">{{ componentTitle(componentName) }}</a>
          </li>
        </ul>
      </section>
    </article>
  </page-frame>
</template>

<style scoped lang="scss">
h1 {
  margin: 0 0 var(--ui-space-3);
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-2xl);
}

.detail h1 {
  margin-top: var(--ui-space-4);
}

h2 {
  margin: var(--ui-space-6) 0 var(--ui-space-3);
  font-size: var(--ui-font-size-lg);
}

.summary {
  margin: 0;
  max-width: 42rem;
  color: var(--ui-color-muted);
  line-height: 1.6;
}
.identity {
  margin: calc(var(--ui-space-2) * -1) 0 var(--ui-space-3);
}

.demo {
  margin-top: var(--ui-space-5);
  overflow: hidden;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
}

.demo-bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-color-border);
}

.demo-bar h2,
.demo-bar h3 {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  font-weight: 560;
}

.demo-bar span {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.demo-body {
  padding: var(--ui-space-6);
  background: var(--ui-color-bg);
}

.case {
  margin-top: var(--ui-space-5);
}

.case > h3 {
  margin: 0;
  font-size: var(--ui-font-size-lg);
}

.example-note {
  margin: 0;
  padding: var(--ui-space-3) var(--ui-space-4) 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  line-height: 1.5;
}

.example-note.standalone {
  padding: var(--ui-space-2) 0 0;
}

.sample {
  margin-top: var(--ui-space-3);
}

.family {
  scroll-margin-top: 4.5rem;
}

.family h2 {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-2);
}

.family h2 a {
  color: var(--ui-color-fg);
  text-decoration: none;
}

.family h2 span {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  font-weight: 400;
}

.note {
  margin: 0 0 var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.note a {
  color: var(--ui-color-accent);
}

.kin ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2) var(--ui-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.kin a {
  display: inline;
  padding: 0;
  border: 0;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

.kin a:hover {
  color: var(--ui-color-accent);
}

ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: var(--ui-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

li a {
  display: block;
  padding: var(--ui-space-2) var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

li a:hover {
  border-color: var(--ui-color-border-strong);
  background: var(--ui-color-subtle);
}

.page > a {
  color: var(--ui-color-accent);
  font-size: var(--ui-font-size-sm);
}

a:focus-visible {
  outline: 2px solid var(--ui-color-focus);
  outline-offset: 3px;
}
</style>
