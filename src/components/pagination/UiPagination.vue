<script setup lang="ts">
import { computed } from 'vue'
import { UiSelect } from '@/components/select'
import { useControllable } from '@/composables/use-controllable'
import type { UiOption } from '@/types/common'
import { pageWindow } from './page-window'

const {
  page,
  pageCount,
  pageSize,
  pageSizes,
  label = 'Pagination',
} = defineProps<{
  page?: number
  pageCount: number
  pageSize?: number
  pageSizes?: readonly number[]
  label?: string
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const state = useControllable({
  value: () => page,
  defaultValue: 1,
  onChange: (next) => {
    emit('update:page', next)
  },
})
const sizeState = useControllable({
  value: () => pageSize,
  defaultValue: () => pageSizes?.[0] ?? 10,
  onChange: (next) => {
    emit('update:pageSize', next)
  },
})

const items = computed(() => pageWindow(state.value.value, pageCount))
const sizeOptions = computed((): readonly UiOption<number>[] =>
  (pageSizes ?? []).map((size) => ({ value: size, label: `${size} / page` })),
)

function setPage(next: number): void {
  const bounded = Math.min(Math.max(next, 1), Math.max(pageCount, 1))
  if (bounded === state.value.value) return
  state.setValue(bounded)
}

function onSize(next: number | null): void {
  if (next === null || !Number.isFinite(next) || next <= 0 || next === sizeState.value.value) return
  sizeState.setValue(next)
  setPage(1)
}
</script>

<template>
  <nav class="ui-pagination" :aria-label="label">
    <button
      class="ui-pagination__arrow"
      type="button"
      aria-label="Previous page"
      :disabled="state.value.value <= 1"
      @click="setPage(state.value.value - 1)"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M9.5 3.5 5.5 8l4 4.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <ol>
      <li v-for="item in items" :key="item === 'gap' ? 'gap' : `page-${item}`">
        <span v-if="item === 'gap'" class="ui-pagination__gap" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          :aria-current="item === state.value.value ? 'page' : undefined"
          :aria-label="`Page ${item}`"
          @click="setPage(item)"
        >
          {{ item }}
        </button>
      </li>
    </ol>
    <button
      class="ui-pagination__arrow"
      type="button"
      aria-label="Next page"
      :disabled="state.value.value >= pageCount"
      @click="setPage(state.value.value + 1)"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M6.5 3.5 10.5 8l-4 4.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <UiSelect
      v-if="sizeOptions.length > 0"
      class="ui-pagination__size"
      :model-value="sizeState.value.value"
      :options="sizeOptions"
      size="sm"
      @update:model-value="onSize"
    />
  </nav>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-pagination {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.ui-pagination ol {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-pagination li {
  display: inline-flex;
}

.ui-pagination__arrow,
.ui-pagination ol button {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: 2px;
  background: transparent;
  color: var(--ui-color-muted);
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--ui-duration) var(--ui-ease),
    border-color var(--ui-duration) var(--ui-ease),
    color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  @include focus-ring(2px);

  &:hover:not(:disabled, [aria-current='page']) {
    border-color: color-mix(in oklch, var(--ui-color-fg) 42%, transparent);
    color: var(--ui-color-fg);
  }

  &:active:not(:disabled) {
    transform: scale(var(--ui-press-scale));
  }
}

.ui-pagination__arrow {
  svg {
    width: 0.85rem;
    height: 0.85rem;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
}

.ui-pagination ol button[aria-current='page'] {
  border-color: var(--ui-color-fg);
  background: var(--ui-color-fg);
  color: var(--ui-color-bg);
}

.ui-pagination__gap {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  color: var(--ui-color-muted);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
}

.ui-pagination__size {
  width: auto;
  margin-inline-start: 0.35rem;

  :deep(.ui-select__button) {
    width: auto;
    height: 1.75rem;
    padding-inline: 0.45rem 0.35rem;
    border-radius: 2px;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  :deep(svg) {
    width: 0.85rem;
    height: 0.85rem;
  }
}
</style>
