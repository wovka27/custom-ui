<script setup lang="ts">
import { computed } from 'vue'
import type { DesignScore } from '@/index'
import { ledgerScore, UiChord, UiCode, UiCopy, UiLink, UiSegmented, UiStack } from '@/index'
import PageFrame from '../frame/PageFrame.vue'
import { guideNeighbors } from '../nav'
import type { SiteLink } from '../nav'
import type { GuideId } from '../route'
import TokenGuide from './TokenGuide.vue'

const { page, score } = defineProps<{
  page: GuideId
  score?: DesignScore
}>()

const emit = defineEmits<{
  'update:score': [score: DesignScore | undefined]
}>()

const install = 'npm i @wovka-dev/custom-ui'
const scores = [
  { value: 'kit', label: 'Kit' },
  { value: 'ledger', label: 'Ledger' },
]
const preset = computed(() => (score?.name === ledgerScore.name ? 'ledger' : 'kit'))
const chordScore = computed(() => score ?? ledgerScore)
const neighbors = computed(() => guideNeighbors(page))
const toc = computed((): readonly SiteLink[] => {
  if (page === 'theming') {
    return [
      { href: '#set', label: 'Set a variable' },
      { href: '#layers', label: 'Two layers' },
      { href: '#component', label: 'One component' },
      { href: '#region', label: 'A whole region' },
      { href: '#fixed', label: 'What stays fixed' },
    ]
  }
  if (page === 'installation') return [{ href: '#import', label: 'Import' }]
  if (page === 'tokens') {
    return [
      { href: '#override', label: 'What an override is' },
      { href: '#try', label: 'Try an override' },
      { href: '#contracts', label: 'Contracts' },
      { href: '#tree', label: 'Override tree' },
      { href: '#inventory', label: 'Every variable' },
    ]
  }
  return []
})

function chooseScore(value: string | number): void {
  emit('update:score', value === 'ledger' ? ledgerScore : undefined)
}

function tune(next: DesignScore): void {
  emit('update:score', next)
}
</script>

<template>
  <page-frame :toc="toc" :previous="neighbors.previous" :next="neighbors.next">
    <article class="guide">
      <p class="kicker">Guide</p>
      <template v-if="page === 'installation'">
        <h1>Installation</h1>
        <p>
          Custom UI is a Vue 3.5 library. Vue stays a peer dependency. Node 22 is the release line.
        </p>
        <div class="command">
          <ui-code block :code="install" />
          <ui-copy :value="install" label="Copy install command">Copy</ui-copy>
        </div>
        <h2 id="import">Import</h2>
        <ui-code
          block
          code="import { createApp } from 'vue'
import { UiConfigProvider } from '@wovka-dev/custom-ui'
import '@wovka-dev/custom-ui/styles.css'"
        />
        <p>
          The package entry is <ui-code code="@wovka-dev/custom-ui" />. Styles ship as
          <ui-code code="@wovka-dev/custom-ui/styles.css" />.
        </p>
      </template>

      <template v-else-if="page === 'quick-start'">
        <h1>Quick start</h1>
        <p>Wrap the app once. Pass a score only when the room should change.</p>
        <ui-code
          block
          code='<ui-config-provider theme="system" locale="en">
  <app />
</ui-config-provider>'
        />
        <p>
          <ui-code code="theme" /> is <ui-code code="light" />, <ui-code code="dark" />, or
          <ui-code code="system" />. <ui-code code="system" /> follows the operating system.
          <ui-code code="useTheme()" /> stores the choice under <ui-code code="ui-theme" />.
        </p>
        <p>
          Continue with <ui-link href="#/guide/state">state</ui-link>,
          <ui-link href="#/guide/theming">theming</ui-link>, or the
          <ui-link href="#/component/button">button</ui-link>.
        </p>
      </template>

      <template v-else-if="page === 'state'">
        <h1>State</h1>
        <p>
          A missing value means the component owns it. A passed value, including null, belongs to
          the parent.
        </p>
        <ul>
          <li><ui-code code="undefined" /> starts from <ui-code code="defaultValue" />.</li>
          <li>A bound prop, even <ui-code code="null" />, is controlled.</li>
          <li>
            On <ui-code code="UiSelect" />, <ui-code code="null" /> is a real “all” choice when
            <ui-code code="all-option" /> is set.
          </li>
        </ul>
      </template>

      <template v-else-if="page === 'theming'">
        <h1>Theming</h1>
        <p>
          Customization is a replacement of CSS variables. Set <ui-code code="--ui-*" /> on an
          ancestor. A component reads <ui-code code="var(--ui-…)" /> and does not declare that name,
          so the ancestor wins.
        </p>

        <h2 id="set">Set a variable</h2>
        <p>
          Put the declaration on <ui-code code=".ui-config" />, or on any element that wraps the
          controls.
        </p>
        <ui-code
          block
          code=".toolbar {
  --ui-button-radius: 2px;
  --ui-color-accent: oklch(0.55 0.14 145);
}"
        />
        <p>
          A button inside <ui-code code=".toolbar" /> uses the new radius. A checked checkbox, a
          slider fill, and a selected day use the new accent, because they read
          <ui-code code="--ui-color-accent" />.
        </p>
        <p>
          A dialog is teleported to <ui-code code="body" /> and still follows the ancestor. It
          copies the computed variables onto itself.
        </p>

        <h2 id="layers">Two layers</h2>
        <p>
          Foundation variables (<ui-code code="--ui-color-*" />, type, space, radii, motion) are
          declared on <ui-code code=":root" />. Changing one restyles every component that reads it.
          A theme color needs a light value and a dark value.
        </p>
        <ui-code
          block
          code=".ui-config {
  --ui-color-accent: oklch(0.45 0.14 250);
}

[data-theme='dark'] .ui-config {
  --ui-color-accent: oklch(0.82 0.12 250);
}"
        />
        <p>
          Component hooks (<ui-code code="--ui-button-*" />, <ui-code code="--ui-control-*" />,
          <ui-code code="--ui-choice-*" />, <ui-code code="--ui-switch-*" />,
          <ui-code code="--ui-table-*" />, <ui-code code="--ui-slider-*" />,
          <ui-code code="--ui-progress-*" />, <ui-code code="--ui-date-day-selected-*" />) start
          unset. Each falls back to a foundation variable or a literal. Set a hook to restyle one
          family and leave the rest of the page alone.
        </p>
        <p>
          One <ui-code code="--ui-button-*" /> value applies to every button variant. The variant
          differences exist only while that variable is unset.
        </p>

        <h2 id="component">One component</h2>
        <p>
          Each component page lists the variables that component reads, the CSS property, the
          fallback, and what it paints. On
          <ui-link href="#/component/button">Button</ui-link>, the CSS variables section is that
          list and the ancestor block for the button hooks. The full inventory is the
          <ui-link href="#/guide/tokens">token guide</ui-link>.
        </p>

        <h2 id="region">A whole region</h2>
        <p>
          A score writes the same variables for one region. It is a name, a hue, a chroma, and a
          grammar for ground, shape, density, motion, elevation, and voice. Pass it to
          <ui-code code="UiConfigProvider" />. Light and dark come from the same score.
        </p>
        <p>
          When one variable must differ from the score, set that variable on an ancestor and leave
          the others unset.
        </p>
        <ui-segmented
          :model-value="preset"
          :options="scores"
          label="Design score"
          size="sm"
          @update:model-value="chooseScore"
        />
        <ui-chord
          class="chord"
          :model-value="chordScore"
          label="Tune a score"
          @update:model-value="tune"
        >
          <ui-stack gap="sm">
            <p>The slot wears the score. The rest of the page keeps the kit.</p>
          </ui-stack>
        </ui-chord>

        <h2 id="fixed">What stays fixed</h2>
        <ul>
          <li>
            Pagination squares stay 28px with a 2px radius. They do not read
            <ui-code code="--ui-button-radius" />.
          </li>
          <li>
            Under <ui-code code="prefers-reduced-motion: reduce" />, durations collapse and
            <ui-code code="--ui-press-scale" /> becomes <ui-code code="1" />. Text fields do not
            scale.
          </li>
          <li>
            Do not add, rename, or remove <ui-code code="--ui-*" /> names, and do not set a public
            variable on the component itself.
          </li>
        </ul>
      </template>

      <token-guide v-else />
    </article>
  </page-frame>
</template>

<style scoped lang="scss">
.kicker {
  margin: 0 0 var(--ui-space-2);
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 var(--ui-space-3);
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-2xl);
}

h2 {
  margin: var(--ui-space-6) 0 var(--ui-space-3);
  font-size: var(--ui-font-size-lg);
}

p,
li {
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-md);
  line-height: 1.6;
}

ul {
  padding-left: 1.2rem;
}

.command {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
  margin: var(--ui-space-4) 0;
}

.chord {
  margin: var(--ui-space-5) 0;
}
</style>
