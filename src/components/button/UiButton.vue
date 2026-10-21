<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'
import type { UiSize } from '@/types/common'
import { className, cn } from '@/lib/cn'
import { warn } from '@/lib/warn'
import type { UiButtonType, UiButtonVariant } from './button.types'

defineOptions({ inheritAttrs: false })

const {
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  block = false,
  iconOnly = false,
  label,
  href,
  target,
  rel,
} = defineProps<{
  variant?: UiButtonVariant
  size?: UiSize
  type?: UiButtonType
  loading?: boolean
  disabled?: boolean
  block?: boolean
  iconOnly?: boolean
  label?: string
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  rel?: string
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  default(): unknown
  leading(): unknown
  trailing(): unknown
}>()

watchEffect(() => {
  if (iconOnly && !label) {
    warn('UiButton', '`iconOnly` requires `label` so the control has an accessible name.')
  }
})

const attrs = useAttrs()
const isAnchor = computed(() => href !== undefined)
const inactive = computed(() => disabled || loading)
const safeRel = computed(() => {
  if (!isAnchor.value) return undefined
  if (target === '_blank') return rel ?? 'noopener noreferrer'
  return rel
})

function onClick(event: MouseEvent): void {
  if (inactive.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="isAnchor ? 'a' : 'button'"
    v-bind="attrs"
    :class="cn('ui-button', className(attrs.class))"
    :type="isAnchor ? undefined : type"
    :href="isAnchor && !inactive ? href : undefined"
    :target="isAnchor ? target : undefined"
    :rel="safeRel"
    :disabled="!isAnchor && disabled ? true : undefined"
    :aria-disabled="inactive || undefined"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly ? label : undefined"
    :data-variant="variant"
    :data-size="size"
    :data-block="block || undefined"
    :data-icon-only="iconOnly || undefined"
    :data-loading="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="ui-button__spinner" aria-hidden="true" />
    <span v-if="$slots.leading" class="ui-button__icon" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span v-if="!iconOnly" class="ui-button__label"><slot /></span>
    <span v-if="$slots.trailing" class="ui-button__icon" aria-hidden="true">
      <slot name="trailing" />
    </span>
  </component>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-button {
  --_bg: var(--ui-button-bg, transparent);
  --_bg-hover: var(
    --ui-button-bg-hover,
    color-mix(in oklch, var(--ui-color-accent) 14%, transparent)
  );
  --_fg: var(--ui-button-fg, var(--ui-color-fg));
  --_fg-hover: var(--ui-button-fg-hover, var(--ui-color-fg));
  --_border: var(--ui-button-border, color-mix(in oklch, var(--ui-color-fg) 18%, transparent));
  --_border-hover: var(--ui-button-border-hover, var(--ui-color-accent));
  --_height: 2rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-2);
  height: var(--_height);
  padding-inline: 1rem;
  border: 1px solid var(--_border);
  border-radius: var(--ui-button-radius, 0.75rem);
  background: var(--_bg);
  color: var(--_fg);
  font-size: 0.8125rem;
  font-weight: 520;
  letter-spacing: 0.01em;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--ui-duration) var(--ui-ease),
    border-color var(--ui-duration) var(--ui-ease),
    color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  @include focus-ring;

  &:hover:not(:disabled, [aria-disabled='true']),
  &[aria-pressed='true']:not(:disabled, [aria-disabled='true']) {
    background: var(--_bg-hover);
    border-color: var(--_border-hover);
    color: var(--_fg-hover);
  }

  &:active:not(:disabled, [aria-disabled='true']) {
    transform: scale(var(--ui-press-scale));
  }

  &:disabled,
  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &[data-size='sm'] {
    --_height: 1.75rem;
    padding-inline: 0.7rem;
    font-size: var(--ui-font-size-xs);
  }

  &[data-size='lg'] {
    --_height: 2.25rem;
    padding-inline: 1.1rem;
  }

  &[data-variant='secondary'] {
    --_bg-hover: var(--ui-button-bg-hover, var(--ui-color-subtle));
    --_border: var(--ui-button-border, var(--ui-color-border));
    --_border-hover: var(--ui-button-border-hover, var(--ui-color-border-strong));
  }

  &[data-variant='ghost'] {
    --_bg-hover: var(--ui-button-bg-hover, var(--ui-color-subtle));
    --_fg: var(--ui-button-fg, var(--ui-color-muted));
    --_fg-hover: var(--ui-button-fg-hover, var(--ui-color-fg));
    --_border: var(--ui-button-border, transparent);
    --_border-hover: var(--ui-button-border-hover, transparent);
  }

  &[data-variant='danger'] {
    --_bg-hover: var(--ui-button-bg-hover, var(--ui-color-danger-subtle));
    --_fg: var(--ui-button-fg, var(--ui-color-danger));
    --_fg-hover: var(--ui-button-fg-hover, var(--ui-color-danger));
    --_border: var(
      --ui-button-border,
      color-mix(in oklch, var(--ui-color-danger) 35%, transparent)
    );
    --_border-hover: var(--ui-button-border-hover, var(--ui-color-danger));
  }

  &[data-block='true'] {
    width: 100%;
  }

  &[data-icon-only='true'] {
    width: var(--_height);
    padding-inline: 0;
  }
}

.ui-button__label,
.ui-button__icon {
  display: inline-flex;
  align-items: center;
}

.ui-button__spinner {
  width: 0.9em;
  height: 0.9em;
  border: 1.5px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: var(--ui-radius-full);
  animation: ui-button-spin 0.7s linear infinite;
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (forced-colors: active) {
  .ui-button {
    border: 1px solid ButtonText;
  }
}
</style>
