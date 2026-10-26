<script setup lang="ts">
import type { UiTone } from '@/types/common'

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
  icon(): unknown
}>()
</script>

<template>
  <div class="ui-alert" :data-tone="tone" :role="tone === 'danger' ? 'alert' : 'status'">
    <span v-if="$slots.icon" class="ui-alert__icon" aria-hidden="true"><slot name="icon" /></span>
    <div class="ui-alert__copy">
      <p class="ui-alert__title">{{ title }}</p>
      <div v-if="description || $slots.default" class="ui-alert__description">
        <slot>{{ description }}</slot>
      </div>
    </div>
    <button
      v-if="dismissible"
      class="ui-alert__dismiss"
      type="button"
      aria-label="Dismiss notification"
      @click="emit('dismiss')"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M4 4l8 8M12 4l-8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3) var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-info-subtle);
  color: var(--ui-color-fg);

  @include tone-surface;
}

.ui-alert__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ui-space-1);
  min-width: 0;
}

.ui-alert__title,
.ui-alert__description {
  margin: 0;
}

.ui-alert__title {
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

.ui-alert__description {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-alert__dismiss {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;

  @include focus-ring(1px);

  svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
