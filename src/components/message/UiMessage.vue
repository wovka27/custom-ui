<script setup lang="ts">
import { dismissMessage, messageItems } from './message'
</script>

<template>
  <div class="ui-message" aria-live="polite">
    <article
      v-for="item in messageItems"
      :key="item.id"
      class="ui-message__item"
      :data-tone="item.tone"
      role="status"
    >
      <div class="ui-message__copy">
        <p v-if="item.title" class="ui-message__title">{{ item.title }}</p>
        <p>{{ item.description }}</p>
      </div>
      <button type="button" aria-label="Dismiss message" @click="dismissMessage(item.id)">×</button>
    </article>
  </div>
</template>

<style scoped lang="scss">
.ui-message {
  position: fixed;
  z-index: var(--ui-z-dialog);
  top: var(--ui-space-4);
  left: 50%;
  display: grid;
  gap: var(--ui-space-2);
  width: min(24rem, calc(100vw - 2rem));
  translate: -50% 0;
  pointer-events: none;
}

.ui-message__item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0 var(--ui-space-3);
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);
  pointer-events: auto;
  animation: ui-reveal var(--ui-duration-reveal) var(--ui-ease) both;

  &[data-tone='success'] {
    border-color: var(--ui-color-success);
  }
  &[data-tone='warning'] {
    border-color: var(--ui-color-warning);
  }
  &[data-tone='danger'] {
    border-color: var(--ui-color-danger);
  }
  &[data-tone='info'],
  &[data-tone='accent'] {
    border-color: var(--ui-color-accent);
  }
}

.ui-message__copy {
  min-width: 0;
}

.ui-message__title {
  font-weight: 650;
}

p {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  overflow-wrap: anywhere;
}

button {
  align-self: start;
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}
</style>
