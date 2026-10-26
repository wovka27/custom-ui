<script setup lang="ts">
const { title, description } = defineProps<{
  title?: string
  description?: string
}>()

defineSlots<{
  header(): unknown
  media(): unknown
  default(): unknown
  actions(): unknown
  footer(): unknown
}>()
</script>

<template>
  <article class="ui-card">
    <div v-if="$slots.media" class="ui-card__media"><slot name="media" /></div>
    <header v-if="title || description || $slots.header" class="ui-card__header">
      <slot name="header">
        <h3 v-if="title">{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </slot>
    </header>
    <div v-if="$slots.default" class="ui-card__body"><slot /></div>
    <footer v-if="$slots.actions || $slots.footer" class="ui-card__footer">
      <slot name="footer" />
      <div v-if="$slots.actions" class="ui-card__actions"><slot name="actions" /></div>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-card {
  @include surface;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.ui-card__media :deep(img) {
  display: block;
  width: 100%;
  height: 9rem;
  object-fit: cover;
}

.ui-card__header,
.ui-card__body,
.ui-card__footer {
  padding: var(--ui-space-4);
}

.ui-card__header h3,
.ui-card__header p,
.ui-card__body :deep(p) {
  margin: 0;
}

.ui-card__header h3 {
  font-size: var(--ui-font-size-md);
}

.ui-card__header p,
.ui-card__body {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  border-top: 1px solid var(--ui-color-border);
}

.ui-card__actions {
  display: flex;
  margin-inline-start: auto;
  gap: var(--ui-space-2);
}
</style>
