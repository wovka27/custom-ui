<script setup lang="ts">
import { computed, h } from 'vue'
import type { VNodeChild } from 'vue'
import { tokenize } from './highlight'

const { block = false, code } = defineProps<{
  block?: boolean
  code?: string
}>()

defineSlots<{
  default(): unknown
}>()

const highlighted = computed(() => {
  if (!block || code === undefined) return undefined
  const children: VNodeChild[] = tokenize(code).map((part) =>
    part.kind === 'text' ? part.text : h('span', { class: `tok-${part.kind}` }, part.text),
  )
  return () => h('code', children)
})
</script>

<template>
  <pre v-if="block && highlighted" class="ui-code" data-block="true"><component :is="highlighted"
  /></pre>
  <pre
    v-else-if="block"
    class="ui-code"
    data-block="true"
  ><code><slot>{{ code }}</slot></code></pre>
  <code v-else class="ui-code"
    ><slot>{{ code }}</slot></code
  >
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-code {
  font-family: var(--ui-font-mono);
  font-size: 0.85em;
}

.ui-code:not([data-block]) {
  padding-inline: 0.3em;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-subtle);
}

.ui-code[data-block] {
  @include surface;
  margin: 0;
  padding: var(--ui-space-3);
  overflow: auto;
  font-size: var(--ui-font-size-xs);
  line-height: 1.6;
  white-space: pre;
}

.ui-code[data-block] :deep(code) {
  font: inherit;
}

.ui-code :deep(.tok-tag) {
  color: var(--ui-color-danger);
}

.ui-code :deep(.tok-attr),
.ui-code :deep(.tok-number) {
  color: var(--ui-color-warning);
}

.ui-code :deep(.tok-string) {
  color: var(--ui-color-success);
}

.ui-code :deep(.tok-keyword) {
  color: var(--ui-color-accent);
}

.ui-code :deep(.tok-comment),
.ui-code :deep(.tok-punct) {
  color: var(--ui-color-muted);
}

.ui-code :deep(.tok-comment) {
  font-style: italic;
}
</style>
