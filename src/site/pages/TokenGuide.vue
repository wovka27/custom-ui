<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiCheckbox, UiCode, UiCopy, UiField, UiInput, UiLink } from '@/index'
import TokenTree from '@/stories/TokenTree.vue'
import { designScoreJson } from '@/styles/score'
import { tokenDefault, tokenOverrideJson, tokenOverrides } from '@/styles/token-override'
import type { TokenRecord } from '@/styles/token-override'

const radius = ref('0.75rem')
const accent = ref('')
const branch = ref('all')
const query = ref('')

const groups = computed(() => [
  { id: 'all', label: 'All' },
  ...tokenOverrides.tree.map((node) => ({ id: node.id, label: node.title })),
])

const frameStyle = computed(() => {
  const style: Record<string, string> = {
    '--ui-button-radius': radius.value,
  }
  const color = accent.value.trim()
  if (color.length > 0) style['--ui-color-accent'] = color
  return style
})

const visible = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return tokenOverrides.tokens.filter((token) => {
    if (branch.value !== 'all' && token.path[0] !== branch.value) return false
    if (needle.length === 0) return true
    return (
      token.name.toLowerCase().includes(needle) ||
      token.affects.toLowerCase().includes(needle) ||
      token.state.toLowerCase().includes(needle)
    )
  })
})

function tokenKey(token: TokenRecord): string {
  return token.name
}
</script>

<template>
  <article class="tokens">
    <h1>Tokens</h1>
    <p>
      Components read public variables and do not declare them again, so a value on an ancestor
      always wins. Set it on <ui-code code=".ui-config" /> or any element that wraps the control.
    </p>
    <ui-code block :code="tokenOverrides.example.css" />
    <ui-copy :value="tokenOverrides.example.css" label="Copy override example"
      >Copy example</ui-copy
    >

    <h2 id="override">What an override is</h2>
    <p>
      Customization is a replacement of these variables on an ancestor. A
      <ui-link href="#/guide/theming">score</ui-link> writes the full set for one region. Fill
      <ui-code code="proposal" /> only when one variable must differ. Leave it null when the kit
      default should remain. Do not add, rename, or remove tokens.
    </p>
    <ul>
      <li v-for="rule in tokenOverrides.rules" :key="rule">{{ rule }}</li>
    </ul>
    <p>
      Foundation tokens are declared on <ui-code code=":root" />. Theme colors and shadows have
      light and dark values. Type, space, radii, motion, and layout metrics are shared. Changing one
      moves every consumer.
    </p>
    <p>
      Component hooks (<ui-code code="--ui-button-*" />, <ui-code code="--ui-control-*" />,
      <ui-code code="--ui-choice-*" />, <ui-code code="--ui-switch-*" />,
      <ui-code code="--ui-table-*" />, <ui-code code="--ui-slider-*" />,
      <ui-code code="--ui-progress-*" />, <ui-code code="--ui-date-day-selected-*" />) are unset.
      Each falls back to a foundation token or a literal. Set the hook to restyle one family. One
      <ui-code code="--ui-button-*" /> value applies to every variant. The variant differences exist
      only while the variable is unset.
    </p>
    <p>
      A theme token needs both a light and a dark value. Pagination stays a 2px square and is not a
      token. Under <ui-code code="prefers-reduced-motion: reduce" />, durations collapse and
      <ui-code code="--ui-press-scale" /> becomes <ui-code code="1" />. Text fields do not scale, so
      the caret does not jump.
    </p>

    <h2 id="try">Try an override</h2>
    <div class="stage" :style="frameStyle">
      <ui-field label="Button radius">
        <ui-input v-model="radius" aria-label="Button radius" />
      </ui-field>
      <ui-field label="Accent">
        <ui-input v-model="accent" aria-label="Accent" placeholder="oklch(0.55 0.14 145)" />
      </ui-field>
      <div class="sample">
        <ui-button>Save</ui-button>
        <ui-button variant="secondary">Cancel</ui-button>
        <ui-input placeholder="Ada" aria-label="Sample name" />
        <ui-checkbox :default-value="true" label="Selected" />
      </div>
    </div>

    <h2 id="contracts">Contracts</h2>
    <p>
      Copy the score when a model should replace the whole visual system. Copy the variable
      inventory when one token must differ from that score.
    </p>
    <div class="copies">
      <ui-copy :value="designScoreJson" label="Copy the design score">Copy score</ui-copy>
      <ui-copy :value="tokenOverrideJson" label="Copy the variable inventory"
        >Copy variables</ui-copy
      >
    </div>
    <details>
      <summary>Score JSON</summary>
      <textarea
        :value="designScoreJson"
        readonly
        spellcheck="false"
        aria-label="Design score JSON"
      />
    </details>
    <details>
      <summary>Variable inventory</summary>
      <textarea
        :value="tokenOverrideJson"
        readonly
        spellcheck="false"
        aria-label="Token override JSON"
      />
    </details>

    <h2 id="tree">Override tree</h2>
    <p>
      Open a branch for the summary, the behavior that is fixed, and each variable with its state,
      CSS property, fallback, and what it paints.
    </p>
    <token-tree
      v-for="node in tokenOverrides.tree"
      :key="node.id"
      :node="node"
      :tokens="tokenOverrides.tokens"
    />

    <h2 id="inventory">Every variable</h2>
    <div class="filters" role="group" aria-label="Token groups">
      <ui-button
        v-for="item in groups"
        :key="item.id"
        size="sm"
        :variant="branch === item.id ? 'primary' : 'secondary'"
        :aria-pressed="branch === item.id"
        @click="branch = item.id"
      >
        {{ item.label }}
      </ui-button>
    </div>
    <ui-field label="Find a variable">
      <ui-input v-model="query" aria-label="Find a variable" placeholder="accent, radius, border" />
    </ui-field>
    <p v-if="visible.length === 0" class="empty">Nothing matches.</p>
    <div v-else class="table-wrap">
      <table>
        <caption class="sr">
          CSS variables that can be overridden from outside the kit
        </caption>
        <thead>
          <tr>
            <th scope="col">Variable</th>
            <th scope="col">State</th>
            <th scope="col">Property</th>
            <th scope="col">Default or fallback</th>
            <th scope="col">What it paints</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in visible" :key="tokenKey(token)">
            <th scope="row">
              <code>{{ token.name }}</code>
            </th>
            <td>{{ token.state }}</td>
            <td>
              <code>{{ token.cssProperty }}</code>
            </td>
            <td>
              <code>{{ tokenDefault(token) }}</code>
            </td>
            <td>{{ token.affects }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style scoped lang="scss">
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
  line-height: 1.6;
}

ul {
  padding-left: 1.2rem;
}

.copies,
.filters,
.sample {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}

.stage {
  display: grid;
  gap: var(--ui-space-3);
  margin-top: var(--ui-space-3);
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
}

.filters {
  margin-bottom: var(--ui-space-3);
}

.empty {
  color: var(--ui-color-muted);
}

.table-wrap {
  margin-top: var(--ui-space-4);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ui-font-size-sm);
}

th,
td {
  padding: var(--ui-space-2) var(--ui-space-3);
  border-bottom: 1px solid var(--ui-color-border);
  text-align: start;
  vertical-align: top;
}

thead th {
  color: var(--ui-color-muted);
  font-weight: 560;
}

code {
  font-family: var(--ui-font-mono);
  font-size: 0.75rem;
}

details {
  margin-top: var(--ui-space-3);
}

summary {
  cursor: pointer;
  font-weight: 560;
}

textarea {
  width: 100%;
  min-height: 16rem;
  margin-top: var(--ui-space-2);
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-bg);
  color: var(--ui-color-fg);
  font-family: var(--ui-font-mono);
  font-size: 0.75rem;
  line-height: 1.5;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
