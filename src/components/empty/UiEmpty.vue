<script setup lang="ts">
export type UiEmptyVariant = 'plain' | 'panel' | 'dashed'

const { title, description, variant = 'panel' } = defineProps<{
  title: string
  description?: string
  variant?: UiEmptyVariant
}>()

defineSlots<{
  default(): unknown
  media(): unknown
  actions(): unknown
}>()
</script>

<template>
  <div class="ui-empty" :data-variant="variant">
    <div v-if="$slots.media" class="ui-empty__media">
      <slot name="media" />
    </div>
    <div class="ui-empty__copy">
      <p class="ui-empty__title">{{ title }}</p>
      <p v-if="description" class="ui-empty__text">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="ui-empty__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-empty {
  display: grid;
  justify-items: center;
  gap: var(--ui-space-3);
  max-width: 24rem;
  margin-inline: auto;
  color: var(--ui-color-fg);
  text-align: center;
}

.ui-empty[data-variant='panel'],
.ui-empty[data-variant='dashed'] {
  width: min(100%, 24rem);
  padding: var(--ui-space-6) var(--ui-space-4);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
}

.ui-empty[data-variant='panel'] {
  border: 1px solid var(--ui-color-border);
}

.ui-empty[data-variant='dashed'] {
  border: 1px dashed var(--ui-color-border-strong);
}

.ui-empty__media {
  display: grid;
  place-items: center;
  color: var(--ui-color-muted);
}

.ui-empty__copy {
  display: grid;
  gap: 0.25rem;
}

.ui-empty__title {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

.ui-empty__text {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ui-space-2);
}
</style>
