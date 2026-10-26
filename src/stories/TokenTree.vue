<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import TokenTree from './TokenTree.vue'
import { tokenDefault, type TokenRecord, type TokenTreeNode } from '@/styles/token-override'

const { node, tokens } = defineProps<{
  node: TokenTreeNode
  tokens: readonly TokenRecord[]
}>()

const details = useTemplateRef('details')

onMounted(() => {
  const element = details.value
  if (element && node.children.length > 0 && node.tokens.length === 0) element.open = true
})

const listed = computed(() => {
  const byName = new Map(tokens.map((token) => [token.name, token]))
  return node.tokens.map((name) => byName.get(name)).filter((token) => token !== undefined)
})
</script>

<template>
  <details ref="details" class="ui-token-tree__node">
    <summary>
      <span>{{ node.title }}</span>
      <small v-if="node.tokens.length > 0">{{ node.tokens.length }}</small>
    </summary>
    <p>{{ node.summary }}</p>
    <ul v-if="node.fixed.length > 0" class="ui-token-tree__fixed">
      <li v-for="note in node.fixed" :key="note">{{ note }}</li>
    </ul>
    <ul v-if="listed.length > 0" class="ui-token-tree__tokens">
      <li v-for="token in listed" :key="token.name">
        <code>{{ token.name }}</code>
        <span class="ui-token-tree__meta">{{ token.state }} · {{ token.cssProperty }}</span>
        <span class="ui-token-tree__default">{{ tokenDefault(token) }}</span>
        <span>{{ token.affects }}</span>
      </li>
    </ul>
    <div v-if="node.children.length > 0" class="ui-token-tree__children">
      <token-tree
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :tokens="tokens"
      />
    </div>
  </details>
</template>

<style scoped lang="scss">
.ui-token-tree__node {
  border-top: 1px solid var(--ui-color-border);
  padding-block: var(--ui-space-2);
}

summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-3);
  color: var(--ui-color-fg);
  font-weight: 650;
  cursor: pointer;
}

small {
  color: var(--ui-color-muted);
  font-weight: 450;
}

p,
li {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-token-tree__fixed,
.ui-token-tree__tokens,
.ui-token-tree__children {
  margin: var(--ui-space-2) 0 0;
  padding-inline-start: var(--ui-space-4);
}

.ui-token-tree__tokens li {
  display: grid;
  gap: 0.15rem;
  margin-bottom: var(--ui-space-3);
}

.ui-token-tree__meta,
.ui-token-tree__default {
  font-family: var(--ui-font-mono);
  font-size: 0.75rem;
}

.ui-token-tree__default {
  color: var(--ui-color-fg);
}

code {
  font-family: var(--ui-font-mono);
  font-size: 0.75rem;
  color: var(--ui-color-fg);
}
</style>
