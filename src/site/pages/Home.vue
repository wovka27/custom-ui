<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DesignScore } from '@/index'
import {
  ledgerScore,
  UiBorderBeam,
  UiButton,
  UiChord,
  UiField,
  UiInput,
  UiMeter,
  UiSegmented,
  UiSlider,
  UiStack,
  UiStatus,
} from '@/index'
import { catalog, componentCount, componentHref, componentTitle, groupHref } from '../catalog'

const berth = ref('North dock')
const caller = ref('Ada')
const watch = ref('open')
const shift = ref('open')
const windowSpan = ref<[number, number]>([24, 76])
const plate = ref<DesignScore>(ledgerScore)
const watches = [
  { value: 'open', label: 'Open' },
  { value: 'held', label: 'Held' },
  { value: 'closed', label: 'Closed' },
]
const watchLabel = computed(
  () => watches.find((item) => item.value === watch.value)?.label ?? 'Open',
)

function setWindow(value: number | readonly [number, number]): void {
  if (typeof value === 'number') return
  const [start, end] = value
  if (typeof start === 'number' && typeof end === 'number') windowSpan.value = [start, end]
}

function indexLabel(index: number): string {
  return String(index + 1).padStart(2, '0')
}
</script>

<template>
  <main id="content" class="home site-measure" tabindex="-1">
    <section class="hero">
      <div class="copy">
        <p class="eyebrow">Vue 3.5 · {{ componentCount }} components · MIT</p>
        <h1>Custom UI</h1>
        <p class="lede">
          A Vue interface kit. Components keep their state. One score restyles the page.
        </p>
        <div class="actions">
          <ui-button href="#/guide/installation">Get started</ui-button>
          <ui-button href="#/component" variant="secondary">Components</ui-button>
        </div>
      </div>

      <ui-border-beam class="stage" mirror glow :duration="10" :radius="6">
        <div class="panel">
          <header class="panel-bar">
            <ui-status label="Night watch" tone="success" pulse />
            <span>{{ watchLabel }}</span>
          </header>
          <div class="panel-body">
            <ui-input v-model="berth" aria-label="Berth name" placeholder="Berth name" />
            <ui-segmented v-model="watch" :options="watches" label="Watch" />
            <div class="window">
              <p>Window {{ windowSpan[0] }} – {{ windowSpan[1] }}</p>
              <ui-slider
                :model-value="windowSpan"
                range
                label="Window"
                @update:model-value="setWindow"
              />
            </div>
            <ui-meter label="Capacity" :value="64" />
          </div>
        </div>
      </ui-border-beam>
    </section>

    <section class="plates" aria-label="Two ways to work">
      <article class="brief">
        <h2>A brief</h2>
        <p>A field, a choice, and the action that files them. Nothing here is a custom control.</p>
        <ui-field label="Caller">
          <ui-input v-model="caller" aria-label="Caller" placeholder="Ada" />
        </ui-field>
        <ui-segmented v-model="shift" :options="watches" label="Shift" />
        <ui-button>File {{ caller.trim() || 'the brief' }}</ui-button>
      </article>
      <article class="score">
        <h2>A score</h2>
        <p>Drag the hue. This plate changes. The rest of the page keeps the kit.</p>
        <ui-chord v-model="plate" label="Tune a score">
          <ui-stack gap="sm">
            <ui-button>Save</ui-button>
            <p class="worn">{{ plate.name }} · hue {{ Math.round(plate.hue) }}</p>
          </ui-stack>
        </ui-chord>
      </article>
    </section>

    <section class="index" aria-labelledby="index-title">
      <h2 id="index-title">Contents</h2>
      <ol>
        <li v-for="(group, index) in catalog" :key="group.id">
          <a class="group" :href="groupHref(group.id)">
            <span class="num">{{ indexLabel(index) }}</span>
            <span>
              <strong>{{ group.title }}</strong>
              <em>{{ group.note }}</em>
            </span>
            <span class="count">{{ group.names.length }}</span>
          </a>
          <p class="names">
            <a
              v-for="componentName in group.names"
              :key="componentName"
              :href="componentHref(componentName)"
            >
              {{ componentTitle(componentName) }}
            </a>
          </p>
        </li>
      </ol>
    </section>
  </main>
</template>

<style scoped lang="scss">
.home {
  padding-block: var(--ui-space-7);
}

.home:focus {
  outline: none;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
  gap: var(--ui-space-7);
  align-items: center;
}

h1 {
  margin: 0;
  font-family: var(--ui-font-display);
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 640;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.eyebrow {
  margin: 0 0 var(--ui-space-4);
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.lede {
  max-width: 28rem;
  margin: var(--ui-space-4) 0 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-lg);
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
  margin-top: var(--ui-space-5);
}

.stage {
  padding: 0;
  background: var(--ui-color-surface);
}

.panel-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-color-border);
}

.panel-bar span {
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.panel-body {
  display: grid;
  gap: var(--ui-space-4);
  padding: var(--ui-space-4);
}

.window p {
  margin: 0 0 var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  font-variant-numeric: tabular-nums;
}

.plates {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(16rem, 0.85fr);
  gap: var(--ui-space-4);
  margin-top: var(--ui-space-7);
}

.brief,
.score {
  display: grid;
  gap: var(--ui-space-4);
  align-content: start;
  padding: var(--ui-space-5);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
}

.brief h2,
.score h2,
.index h2 {
  margin: 0;
  font-size: var(--ui-font-size-lg);
}

.brief p,
.score > p {
  margin: calc(var(--ui-space-3) * -1) 0 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  line-height: 1.5;
}

.worn {
  margin: 0;
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.index {
  margin-top: var(--ui-space-7);
}

.index h2 {
  margin-bottom: var(--ui-space-3);
}

.index ol {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--ui-color-border);
}

.index li {
  display: grid;
  grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr);
  gap: var(--ui-space-4);
  align-items: start;
  padding: var(--ui-space-4) 0;
  border-bottom: 1px solid var(--ui-color-border);
}

.group {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  gap: var(--ui-space-3);
  align-items: baseline;
  color: var(--ui-color-fg);
  text-decoration: none;
}

.group strong {
  display: block;
  font-size: var(--ui-font-size-md);
}

.group em {
  display: block;
  margin-top: 0.15rem;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  font-style: normal;
  line-height: 1.4;
}

.num,
.count {
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
}

.names {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-1) var(--ui-space-3);
  margin: 0;
  padding-top: 0.15rem;
}

.names a {
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

.group:hover strong,
.names a:hover {
  color: var(--ui-color-accent);
}

.group:focus-visible,
.names a:focus-visible {
  outline: 2px solid var(--ui-color-focus);
  outline-offset: 3px;
}

@media (max-width: 900px) {
  .hero,
  .plates,
  .index li {
    grid-template-columns: 1fr;
  }
}
</style>
