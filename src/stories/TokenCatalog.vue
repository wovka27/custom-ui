<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { UiButton } from '@/components/button'
import { UiCheckbox } from '@/components/checkbox'
import { UiInput } from '@/components/input'
import TokenTree from './TokenTree.vue'
import {
  tokenDefault,
  tokenOverrideJson,
  tokenOverrides,
  type TokenRecord,
} from '@/styles/token-override'

type CopyState = { status: 'idle' } | { status: 'copied' } | { status: 'failed' }

const radius = ref('0.75rem')
const accent = ref('')
const branch = ref('all')
const copyState = ref<CopyState>({ status: 'idle' })
const jsonDetails = useTemplateRef('jsonDetails')

const branches = computed(() => [
  { id: 'all', label: 'All' },
  ...tokenOverrides.tree.map((node) => ({ id: node.id, label: node.title })),
])

const visible = computed(() =>
  tokenOverrides.tokens.filter((token) => branch.value === 'all' || token.path[0] === branch.value),
)

const frameStyle = computed(() => {
  const style: Record<string, string> = {
    '--ui-button-radius': radius.value,
  }
  if (accent.value.trim().length > 0) style['--ui-color-accent'] = accent.value.trim()
  return style
})

const copyMessage = computed(() => {
  if (copyState.value.status === 'copied') return 'Copied. Paste it into the model with the company design.'
  if (copyState.value.status === 'failed') return 'Clipboard was blocked. Select the JSON below.'
  return ''
})

function tokenKey(token: TokenRecord): string {
  return token.name
}

async function copyJson(): Promise<void> {
  try {
    await globalThis.navigator.clipboard.writeText(tokenOverrideJson)
    copyState.value = { status: 'copied' }
  } catch {
    copyState.value = { status: 'failed' }
    const details = jsonDetails.value
    if (details) details.open = true
  }
}
</script>

<template>
  <div class="ui-tokens">
    <section class="ui-tokens__live" :style="frameStyle">
      <p class="ui-tokens__lead">
        Set a variable on any ancestor. Components read it with a fallback, so your value wins
        without editing the kit.
      </p>
      <label>
        Button radius
        <input v-model="radius" type="text" spellcheck="false" />
      </label>
      <label>
        Accent
        <input v-model="accent" type="text" placeholder="oklch(0.55 0.14 145)" spellcheck="false" />
      </label>
      <div class="ui-tokens__sample">
        <UiButton>Save</UiButton>
        <UiInput placeholder="Ada" aria-label="Sample name" />
        <UiCheckbox :default-value="true" label="Selected" />
      </div>
    </section>
    <section class="ui-tokens__contract">
      <div class="ui-tokens__contract-head">
        <h2>Override contract</h2>
        <button type="button" @click="copyJson">Copy JSON</button>
      </div>
      <p>
        The same document lives in <code>src/styles/token-overrides.json</code>. Paste it into a
        model with the company design. The model fills <code>proposal</code> and must not invent
        token names.
      </p>
      <ul>
        <li v-for="rule in tokenOverrides.rules" :key="rule">{{ rule }}</li>
      </ul>
      <p class="ui-tokens__status" role="status" aria-live="polite">{{ copyMessage }}</p>
      <details ref="jsonDetails">
        <summary>JSON for a design model</summary>
        <textarea :value="tokenOverrideJson" readonly spellcheck="false" aria-label="Token override JSON" />
      </details>
    </section>

    <section class="ui-tokens__tree" aria-label="Override tree">
      <h2>Override tree</h2>
      <p>
        Foundation tokens sit on <code>:root</code>. Component hooks are unset and fall back to a
        foundation token or a literal. Open a branch to see the state, the CSS property, and the
        fallback.
      </p>
      <TokenTree
        v-for="node in tokenOverrides.tree"
        :key="node.id"
        :node="node"
        :tokens="tokenOverrides.tokens"
      />
    </section>

    <div class="ui-tokens__filters" role="tablist" aria-label="Token groups">
      <button
        v-for="item in branches"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="branch === item.id"
        @click="branch = item.id"
      >
        {{ item.label }}
      </button>
    </div>
    <p v-if="visible.length === 0" class="ui-tokens__empty">
      This branch has no override variable. The fixed behavior is in the tree above.
    </p>
    <table v-else>
      <caption class="ui-sr-only">CSS variables that can be overridden from outside the kit</caption>
      <thead>
        <tr>
          <th scope="col">Variable</th>
          <th scope="col">State</th>
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
            <code>{{ tokenDefault(token) }}</code>
          </td>
          <td>{{ token.affects }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.ui-tokens {
  width: min(52rem, 100%);
  min-width: 0;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
}

.ui-tokens__live,
.ui-tokens__sample,
.ui-tokens__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
  align-items: end;
}

.ui-tokens__live {
  margin-bottom: var(--ui-space-4);
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
}

.ui-tokens__lead {
  flex: 1 1 16rem;
  margin: 0;
  color: var(--ui-color-muted);
}

label {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  min-width: 12rem;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

input {
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-2);
  border: 1px solid var(--ui-control-border, var(--ui-color-border));
  border-radius: var(--ui-control-radius, var(--ui-radius-md));
  background: var(--ui-control-bg, var(--ui-color-surface));
  color: var(--ui-color-fg);
}

.ui-tokens__sample {
  flex: 1 1 100%;
  align-items: center;
}

.ui-tokens__sample :deep(.ui-input) {
  width: 12rem;
}

.ui-tokens__filters {
  margin-bottom: var(--ui-space-3);
}

.ui-tokens__filters button {
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-full);
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;
}

.ui-tokens__filters button[aria-selected='true'] {
  border-color: var(--ui-color-accent);
  color: var(--ui-color-fg);
}

.ui-tokens__contract,
.ui-tokens__tree {
  margin-bottom: var(--ui-space-5);
}

.ui-tokens__contract-head,
.ui-tokens__contract h2,
.ui-tokens__tree h2 {
  margin: 0;
}

.ui-tokens__contract-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  margin-bottom: var(--ui-space-2);
}

.ui-tokens__contract-head button {
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-radius, 0.75rem);
  background: transparent;
  color: var(--ui-color-fg);
  cursor: pointer;
}

.ui-tokens__contract ul,
.ui-tokens__tree > p,
.ui-tokens__empty,
.ui-tokens__status {
  color: var(--ui-color-muted);
}

.ui-tokens__status:empty {
  display: none;
}

.ui-tokens__contract textarea {
  width: 100%;
  min-height: 16rem;
  margin-top: var(--ui-space-2);
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  font-family: var(--ui-font-mono);
  font-size: 0.75rem;
  resize: vertical;
}

table {
  width: 100%;
  border-collapse: collapse;
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
  font-size: var(--ui-font-size-xs);
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

code {
  font-family: var(--ui-font-mono);
  font-size: 0.75rem;
}
</style>
