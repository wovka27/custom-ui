<script setup lang="ts">
import { computed, ref } from 'vue'
import { indexLetters, type UiIndexItem } from './letters'

const { items, label = 'Index' } = defineProps<{
  items: readonly UiIndexItem[]
  label?: string
}>()

const emit = defineEmits<{
  select: [letter: string]
}>()

defineSlots<{
  item(props: { item: UiIndexItem }): unknown
}>()

const letters = computed(() => indexLetters(items))
const current = ref('')
const active = computed(() => current.value || letters.value[0] || '')
const shown = computed(() =>
  items.filter((item) => item.label.trim().charAt(0).toLocaleUpperCase() === active.value),
)

function pick(letter: string): void {
  current.value = letter
  emit('select', letter)
}
</script>

<template>
  <div class="ui-index">
    <nav :aria-label="label">
      <button
        v-for="letter in letters"
        :key="letter"
        type="button"
        :aria-pressed="letter === active"
        @click="pick(letter)"
      >
        {{ letter }}
      </button>
    </nav>
    <ul>
      <li v-for="item in shown" :key="item.id">
        <slot name="item" :item="item">{{ item.label }}</slot>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-index {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--ui-space-3);
  min-width: 0;
}

nav {
  display: grid;
  justify-items: center;
  gap: 0.1rem;
}

button {
  @include focus-ring(1px);
  width: 1.4rem;
  height: 1.4rem;
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  cursor: pointer;

  &[aria-pressed='true'] {
    background: var(--ui-color-accent);
    color: var(--ui-color-accent-fg);
  }
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--ui-font-size-sm);
}

li + li {
  margin-top: var(--ui-space-1);
}
</style>
