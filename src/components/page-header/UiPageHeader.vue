<script setup lang="ts">
const { title, description } = defineProps<{
  title: string
  description?: string
}>()

defineSlots<{
  eyebrow(): unknown
  title(): unknown
  description(): unknown
  meta(): unknown
  actions(): unknown
}>()
</script>

<template>
  <header class="ui-page-header">
    <div class="ui-page-header__copy">
      <p v-if="$slots.eyebrow" class="ui-page-header__eyebrow"><slot name="eyebrow" /></p>
      <h1>
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="description || $slots.description">
        <slot name="description">{{ description }}</slot>
      </p>
      <div v-if="$slots.meta" class="ui-page-header__meta"><slot name="meta" /></div>
    </div>
    <div v-if="$slots.actions" class="ui-page-header__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped lang="scss">
.ui-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ui-space-4);
  min-width: 0;
}

.ui-page-header__copy {
  min-width: 0;
}

.ui-page-header__eyebrow,
h1,
p {
  margin: 0;
}

.ui-page-header__eyebrow {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-xl);
}

p {
  margin-top: var(--ui-space-1);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-page-header__meta,
.ui-page-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-3);
}

.ui-page-header__actions {
  margin-top: 0;
}
</style>
