<script setup lang="ts">
import { computed, onMounted, onScopeDispose, provide, shallowRef, useId, watch } from 'vue'
import { fieldContextKey } from '@/composables/use-field-control'

const {
  label,
  hint,
  error,
  hideLabel = false,
  disabled = false,
  required = false,
} = defineProps<{
  label: string
  hint?: string
  error?: string
  hideLabel?: boolean
  disabled?: boolean
  required?: boolean
}>()

defineSlots<{
  default(): unknown
}>()

const uid = useId()
const fieldId = `${uid}-control`
const hintId = `${uid}-hint`
const errorId = `${uid}-error`
const hintText = shallowRef(hint ?? '')
const errorText = shallowRef(error ?? '')
const motion = shallowRef(false)
let motionFrame = 0

const describedBy = computed(() => {
  const ids = [hint ? hintId : undefined, error ? errorId : undefined].filter(
    (id): id is string => typeof id === 'string',
  )
  return ids.length > 0 ? ids.join(' ') : undefined
})

watch(
  () => hint,
  (value) => {
    if (value) hintText.value = value
  },
)

watch(
  () => error,
  (value) => {
    if (value) errorText.value = value
  },
)

provide(
  fieldContextKey,
  computed(() => ({
    fieldId,
    describedBy: describedBy.value,
    errorId: error ? errorId : undefined,
    invalid: Boolean(error),
    disabled,
    required,
  })),
)

onMounted(() => {
  motionFrame = window.requestAnimationFrame(() => {
    motion.value = true
  })
})

onScopeDispose(() => {
  window.cancelAnimationFrame(motionFrame)
})
</script>

<template>
  <div
    class="ui-field"
    :data-invalid="error ? 'true' : undefined"
    :data-disabled="disabled || undefined"
    :data-motion="motion || undefined"
  >
    <label class="ui-field__label" :class="{ 'ui-sr-only': hideLabel }" :for="fieldId">
      {{ label }}
      <span v-if="required" class="ui-field__mark" aria-hidden="true">*</span>
      <span v-if="required" class="ui-sr-only">required</span>
    </label>
    <div class="ui-field__control">
      <slot />
    </div>
    <div class="ui-field__note" :data-open="hint ? 'true' : undefined">
      <div class="ui-field__clip">
        <p
          :id="hintId"
          class="ui-field__copy"
          data-tone="hint"
          :aria-hidden="hint ? undefined : true"
        >
          {{ hintText }}
        </p>
      </div>
    </div>
    <div class="ui-field__note" :data-open="error ? 'true' : undefined">
      <div class="ui-field__clip">
        <p
          :id="errorId"
          class="ui-field__copy"
          data-tone="error"
          :role="error ? 'alert' : undefined"
          :aria-hidden="error ? undefined : true"
        >
          {{ errorText }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  text-align: start;
}

.ui-field__label {
  margin-bottom: var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-weight: 560;
  letter-spacing: 0.04em;
  transition: color var(--ui-duration) var(--ui-ease);

  &.ui-sr-only {
    margin-bottom: 0;
  }
}

.ui-field[data-invalid='true'] > .ui-field__label {
  color: var(--ui-color-danger);
}

.ui-field__mark {
  margin-inline-start: 0.15rem;
  color: var(--ui-color-danger);
}

.ui-field__control {
  min-width: 0;
}

.ui-field__note {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
}

.ui-field[data-motion='true'] .ui-field__note {
  transition:
    grid-template-rows var(--ui-duration-reveal) var(--ui-ease),
    opacity var(--ui-duration-reveal) var(--ui-ease);
}

.ui-field__note[data-open='true'] {
  grid-template-rows: 1fr;
  opacity: 1;
}

.ui-field__clip {
  min-height: 0;
  overflow: clip;
}

.ui-field__copy {
  margin: 0;
  padding-top: var(--ui-space-2);
  font-size: var(--ui-font-size-xs);
  line-height: 1.4;
  transform: translateY(-0.25rem);
}

.ui-field[data-motion='true'] .ui-field__copy {
  transition: transform var(--ui-duration-reveal) var(--ui-ease);
}

.ui-field__note[data-open='true'] .ui-field__copy {
  transform: translateY(0);
}

.ui-field__copy[data-tone='hint'] {
  color: var(--ui-color-muted);
}

.ui-field__copy[data-tone='error'] {
  color: var(--ui-color-danger);
}
</style>
