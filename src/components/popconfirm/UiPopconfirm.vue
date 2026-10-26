<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { useAnchoredPosition } from '@/composables/use-anchored-position'
import { UiButton } from '@/components/button'

const {
  title,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
} = defineProps<{
  title: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

defineSlots<{
  trigger(props: { open: boolean; toggle: () => void }): unknown
}>()

const open = ref(false)
const triggerRef = useTemplateRef<HTMLElement>('trigger')
const panelRef = useTemplateRef<HTMLElement>('panel')
const position = useAnchoredPosition(
  () => triggerRef.value,
  () => panelRef.value,
  'bottom',
  'start',
  () => open.value,
)

function toggle(): void {
  open.value = !open.value
}

function confirm(): void {
  open.value = false
  emit('confirm')
}

function cancel(): void {
  open.value = false
  emit('cancel')
}

watch(open, async (value) => {
  if (!value) return
  await nextTick()
  position.update()
})
</script>

<template>
  <div class="ui-popconfirm">
    <div ref="trigger">
      <slot name="trigger" :open="open" :toggle="toggle">
        <ui-button size="sm" variant="secondary" :aria-expanded="open" @click="toggle">
          {{ title }}
        </ui-button>
      </slot>
    </div>
    <div v-if="open" ref="panel" class="ui-popconfirm__panel" role="dialog" :aria-label="title">
      <p>{{ title }}</p>
      <div class="ui-popconfirm__actions">
        <ui-button size="sm" variant="ghost" @click="cancel">{{ cancelLabel }}</ui-button>
        <ui-button size="sm" :variant="danger ? 'danger' : 'primary'" @click="confirm">
          {{ confirmLabel }}
        </ui-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-popconfirm {
  position: relative;
  display: inline-flex;
}

.ui-popconfirm__panel {
  @include popup;
  z-index: var(--ui-z-dropdown);
  display: grid;
  gap: var(--ui-space-3);
  width: max-content;
  max-width: 16rem;
  padding: var(--ui-space-3);
}

p {
  margin: 0;
  font-size: var(--ui-font-size-sm);
}

.ui-popconfirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-space-2);
}
</style>
