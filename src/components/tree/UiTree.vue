<script setup lang="ts">
import { computed, useId } from 'vue'
import { useControllable, usePropWasPassed } from '@/composables/use-controllable'
import { visibleTreeRows, type UiTreeNode } from './tree'

const {
  nodes,
  expanded,
  selected,
  defaultExpanded = [],
  defaultSelected = null,
  label = 'Tree',
} = defineProps<{
  nodes: readonly UiTreeNode[]
  expanded?: readonly string[]
  selected?: string | null
  defaultExpanded?: readonly string[]
  defaultSelected?: string | null
  label?: string
}>()

const emit = defineEmits<{
  'update:expanded': [ids: string[]]
  'update:selected': [id: string | null]
}>()

defineSlots<{
  node(props: { node: UiTreeNode; depth: number; expanded: boolean; selected: boolean }): unknown
}>()

const expandedPassed = usePropWasPassed('expanded')
const selectedPassed = usePropWasPassed('selected')
const expandedState = useControllable<readonly string[]>({
  value: () => (expandedPassed() ? expanded : undefined),
  defaultValue: () => defaultExpanded,
  onChange: (next) => {
    emit('update:expanded', [...next])
  },
})
const selectedState = useControllable<string | null>({
  value: () => (selectedPassed() ? selected : undefined),
  defaultValue: () => defaultSelected,
  onChange: (next) => {
    emit('update:selected', next)
  },
})

const treeId = useId()
const openIds = computed(() => new Set(expandedState.value.value))
const rows = computed(() => visibleTreeRows(nodes, openIds.value))

function toggle(node: UiTreeNode): void {
  if (!node.children || node.children.length === 0) return
  const next = new Set(openIds.value)
  if (next.has(node.id)) next.delete(node.id)
  else next.add(node.id)
  expandedState.setValue([...next])
}

function select(node: UiTreeNode): void {
  if (node.disabled) return
  selectedState.setValue(node.id)
}

function onKey(event: KeyboardEvent, index: number): void {
  const row = rows.value[index]
  if (!row) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const next = rows.value[index + (event.key === 'ArrowDown' ? 1 : -1)]
    if (!next) return
    document.getElementById(`${treeId}-${next.node.id}`)?.focus()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    if (row.node.children && !openIds.value.has(row.node.id)) toggle(row.node)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    if (openIds.value.has(row.node.id)) toggle(row.node)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    select(row.node)
  }
}
</script>

<template>
  <div class="ui-tree" role="tree" :aria-label="label">
    <div
      v-for="(row, index) in rows"
      :id="`${treeId}-${row.node.id}`"
      :key="row.node.id"
      class="ui-tree__row"
      role="treeitem"
      :aria-expanded="
        row.node.children && row.node.children.length > 0 ? openIds.has(row.node.id) : undefined
      "
      :aria-selected="selectedState.value.value === row.node.id"
      :aria-disabled="row.node.disabled || undefined"
      :tabindex="index === 0 ? 0 : -1"
      :style="{ paddingInlineStart: `${row.depth + 0.5}rem` }"
      @click="select(row.node)"
      @keydown="onKey($event, index)"
    >
      <button
        v-if="row.node.children && row.node.children.length > 0"
        type="button"
        class="ui-tree__twist"
        :aria-label="openIds.has(row.node.id) ? 'Collapse' : 'Expand'"
        @click.stop="toggle(row.node)"
      >
        {{ openIds.has(row.node.id) ? '–' : '+' }}
      </button>
      <span v-else class="ui-tree__twist" aria-hidden="true" />
      <slot
        name="node"
        :node="row.node"
        :depth="row.depth"
        :expanded="openIds.has(row.node.id)"
        :selected="selectedState.value.value === row.node.id"
      >
        {{ row.node.label }}
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-tree {
  @include surface;
  display: grid;
  padding-block: var(--ui-space-1);
  font-size: var(--ui-font-size-sm);
}

.ui-tree__row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  min-height: 2rem;
  padding-inline-end: var(--ui-space-2);
  cursor: pointer;

  @include focus-ring(1px);

  &[aria-selected='true'] {
    background: var(--ui-color-accent-subtle);
  }

  &[aria-disabled='true'] {
    color: var(--ui-color-muted);
    cursor: not-allowed;
  }
}

.ui-tree__twist {
  @include icon-control(1.25rem);
  font-size: var(--ui-font-size-xs);
}
</style>
