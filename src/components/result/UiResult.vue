<script setup lang="ts">
import type { UiTone } from '@/types/common'

const {
  title,
  description,
  tone = 'neutral',
} = defineProps<{
  title: string
  description?: string
  tone?: UiTone
}>()

defineSlots<{
  media(): unknown
  default(): unknown
  actions(): unknown
}>()
</script>

<template>
  <section class="ui-result" :data-tone="tone">
    <div v-if="$slots.media" class="ui-result__media" aria-hidden="true"><slot name="media" /></div>
    <h2>{{ title }}</h2>
    <p v-if="description || $slots.default">
      <slot>{{ description }}</slot>
    </p>
    <div v-if="$slots.actions" class="ui-result__actions"><slot name="actions" /></div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-result {
  @include surface;
  display: grid;
  justify-items: center;
  gap: var(--ui-space-2);
  padding: var(--ui-space-6) var(--ui-space-4);
  text-align: center;
}

h2,
p {
  margin: 0;
  max-width: 36rem;
}

h2 {
  font-size: var(--ui-font-size-lg);
}

p {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-result__media {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: var(--ui-space-2);
  border-radius: var(--ui-radius-full);
  font-weight: 650;
}

.ui-result[data-tone='success'] .ui-result__media {
  background: var(--ui-color-success-subtle);
  color: var(--ui-color-success);
}
.ui-result[data-tone='danger'] .ui-result__media {
  background: var(--ui-color-danger-subtle);
  color: var(--ui-color-danger);
}
.ui-result[data-tone='warning'] .ui-result__media {
  background: var(--ui-color-warning-subtle);
  color: var(--ui-color-warning-fg);
}
.ui-result[data-tone='accent'] .ui-result__media,
.ui-result[data-tone='info'] .ui-result__media {
  background: var(--ui-color-accent-subtle);
  color: var(--ui-color-accent);
}

.ui-result__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ui-space-2);
  margin-top: var(--ui-space-3);
}
</style>
