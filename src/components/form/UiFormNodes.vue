<script setup lang="ts">
import { computed, inject, onMounted, onScopeDispose, shallowRef, useSlots, watchEffect } from 'vue'
import type { UiGap } from '@/types/common'
import { UiGrid } from '@/components/layout'
import { warn } from '@/lib/warn'
import { formContextKey, formSlotsKey } from './context'
import {
  isFormQuery,
  isVisible,
  sourceKey,
  whenKey,
  type FormAsyncState,
  type FormBlock,
  type FormGroup,
  type FormNode,
} from './schema'
import UiFormField from './UiFormField.vue'
import UiFormRegion from './UiFormRegion.vue'

const { nodes, columns, gap } = defineProps<{
  nodes: readonly FormNode[]
  columns: string
  gap: UiGap
}>()

const form = inject(formContextKey)
const slots = inject(formSlotsKey, useSlots())
if (!form) throw new Error('UiFormNodes must be used inside UiForm.')

const visible = computed(() =>
  nodes.filter((node) => isVisible(node, form.values.value, form.queries.value)),
)
const settled = shallowRef(false)
const initial = new Set<string>()
let frame = 0

function spanOf(node: FormNode): 'auto' | 'full' {
  if (node.kind === 'group' || node.kind === 'block') return 'full'
  if (node.kind === 'table') return node.span ?? 'full'
  return node.span ?? 'auto'
}

function nodeKey(node: FormNode): string {
  if (node.kind === 'group' || node.kind === 'block') return node.id
  return node.name
}

function regionState(node: FormGroup | FormBlock): FormAsyncState<unknown> {
  if (node.source) {
    const source = form?.queries.value[sourceKey(node)]
    if (source && source.status !== 'idle') return source
  }
  if (isFormQuery(node.when)) return form?.queries.value[whenKey(node)] ?? { status: 'idle' }
  return { status: 'idle' }
}

function sectionName(id: string): string | undefined {
  const name = `section-${id}`
  return slots[name] ? name : undefined
}

watchEffect(() => {
  for (const node of visible.value) {
    if (node.kind === 'block' && !slots[`block-${node.id}`]) {
      warn('UiForm', `Block "${node.id}" expects a "block-${node.id}" slot.`)
    }
  }
})

function entering(node: FormNode): boolean {
  return settled.value && !initial.has(nodeKey(node))
}

onMounted(() => {
  for (const node of visible.value) initial.add(nodeKey(node))
  frame = window.requestAnimationFrame(() => {
    settled.value = true
  })
})

onScopeDispose(() => {
  window.cancelAnimationFrame(frame)
})
</script>

<template>
  <ui-grid :gap="gap" :min-column="columns">
    <template v-for="node in visible" :key="nodeKey(node)">
      <div
        v-if="node.kind === 'group'"
        class="ui-form__item"
        :class="{ 'ui-reveal': entering(node) }"
        data-span="full"
      >
        <fieldset class="ui-form__group">
          <legend v-if="node.title" class="ui-form__legend">{{ node.title }}</legend>
          <p v-if="node.description" class="ui-form__description">{{ node.description }}</p>
          <div v-if="sectionName(node.id)" class="ui-form__section">
            <ui-form-region :name="sectionName(node.id) ?? ''" :state="regionState(node)" />
          </div>
          <ui-form-nodes
            :nodes="node.fields"
            :columns="node.columns ?? columns"
            :gap="node.gap ?? gap"
          />
        </fieldset>
      </div>
      <div
        v-else-if="node.kind === 'block'"
        class="ui-form__item ui-form__block"
        :class="{ 'ui-reveal': entering(node) }"
        :data-span="node.span ?? 'full'"
        :data-block="node.id"
      >
        <ui-form-region :name="`block-${node.id}`" :state="regionState(node)" />
      </div>
      <div
        v-else
        class="ui-form__item"
        :class="{ 'ui-reveal': entering(node) }"
        :data-span="spanOf(node)"
        :data-field="node.name"
      >
        <ui-form-field :field="node" />
      </div>
    </template>
  </ui-grid>
</template>

<style scoped lang="scss">
.ui-form__item {
  min-width: 0;
  max-width: 100%;
}

.ui-form__item[data-span='full'] {
  grid-column: 1 / -1;
}

.ui-form__group {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.ui-form__legend {
  display: block;
  width: 100%;
  margin: 0 0 var(--ui-space-3);
  padding: 0;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  font-weight: 560;
  letter-spacing: -0.03em;
}

.ui-form__description {
  margin: 0 0 var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  line-height: 1.4;
}

.ui-form__section {
  min-width: 0;
  margin: 0 0 var(--ui-space-3);
}

.ui-form__block {
  min-width: 0;
}
</style>
