<script setup lang="ts">
import type { UiTone } from '@/types/common'
import { UiCloseButton } from '@/components/close'

const {
  title,
  description,
  tone = 'info',
  dismissible = false,
} = defineProps<{
  title: string
  description?: string
  tone?: UiTone
  dismissible?: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()

defineSlots<{
  default(): unknown
  actions(): unknown
}>()
</script>

<template>
  <div class="ui-banner" :data-tone="tone" :role="tone === 'danger' ? 'alert' : 'status'">
    <div class="ui-banner__copy">
      <p class="ui-banner__title">{{ title }}</p>
      <p v-if="description || $slots.default">
        <slot>{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="ui-banner__actions"><slot name="actions" /></div>
    <ui-close-button v-if="dismissible" label="Dismiss banner" @click="emit('dismiss')" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3) var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-color-fg);

  @include tone-surface;
}

.ui-banner__copy {
  flex: 1;
  min-width: 12rem;
}

.ui-banner__title,
p {
  margin: 0;
}

.ui-banner__title {
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

p {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-banner__actions {
  display: flex;
  gap: var(--ui-space-2);
}
</style>
