<script setup lang="ts">
import type { UiDescriptionItem } from './description'

const { items = [], label } = defineProps<{
  items?: readonly UiDescriptionItem[]
  label?: string
}>()

defineSlots<{
  default(): unknown
  item(props: { item: UiDescriptionItem }): unknown
}>()
</script>

<template>
  <dl class="ui-description" :aria-label="label">
    <slot>
      <div v-for="item in items" :key="item.term" class="ui-description__row">
        <slot name="item" :item="item">
          <dt>{{ item.term }}</dt>
          <dd>{{ item.detail }}</dd>
        </slot>
      </div>
    </slot>
  </dl>
</template>

<style scoped lang="scss">
.ui-description {
  display: grid;
  margin: 0;
}

.ui-description__row {
  display: grid;
  grid-template-columns: minmax(7rem, 0.4fr) 1fr;
  gap: var(--ui-space-3);
  padding-block: var(--ui-space-2);
  border-bottom: 1px solid var(--ui-color-border);
}

dt,
dd {
  margin: 0;
  font-size: var(--ui-font-size-sm);
}

dt {
  color: var(--ui-color-muted);
}

dd {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
