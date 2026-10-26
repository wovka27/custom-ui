<script setup lang="ts">
import { dismissNotification, notificationItems } from './notification'
</script>

<template>
  <transition-group tag="div" class="ui-notification" name="ui-note" aria-live="polite">
    <article
      v-for="item in notificationItems"
      :key="item.id"
      class="ui-notification__item"
      :data-tone="item.tone"
      role="status"
    >
      <header>
        <strong>{{ item.title || 'Notice' }}</strong>
        <button
          type="button"
          aria-label="Dismiss notification"
          @click="dismissNotification(item.id)"
        >
          ×
        </button>
      </header>
      <p>{{ item.description }}</p>
    </article>
  </transition-group>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-notification {
  position: fixed;
  z-index: var(--ui-z-dialog);
  inset-block-start: var(--ui-space-4);
  inset-inline-end: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ui-space-2);
  width: min(22rem, 100vw);
  padding-inline-end: var(--ui-space-4);
  pointer-events: none;
}

.ui-notification__item {
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-inline-start: 3px solid var(--ui-color-fg);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);
  pointer-events: auto;

  @include tone-mark(border-inline-start-color);
}

.ui-note-enter-from,
.ui-note-leave-to {
  translate: calc(100% + var(--ui-space-4)) 0;
}

.ui-note-enter-active,
.ui-note-leave-active,
.ui-note-move {
  transition:
    translate 240ms var(--ui-ease),
    transform 240ms var(--ui-ease);
}

:dir(rtl) .ui-note-enter-from,
:dir(rtl) .ui-note-leave-to {
  translate: calc(-100% - var(--ui-space-4)) 0;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
}

p {
  margin: var(--ui-space-1) 0 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

button {
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  font-size: 1.1rem;
  cursor: pointer;
}
</style>
