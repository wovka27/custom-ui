<script setup lang="ts">
import { useId } from 'vue'
import type { UiFloatingAlign, UiFloatingSide } from '@/composables/use-anchored-position'
import { UiPopover } from '@/components/popover'

const {
  content,
  placement = 'top',
  align = 'center',
} = defineProps<{
  content?: string
  placement?: UiFloatingSide
  align?: UiFloatingAlign
}>()

defineSlots<{
  default(props: { describedBy: string }): unknown
  content(): unknown
}>()

const describedBy = useId()
</script>

<template>
  <UiPopover
    trigger="hover"
    :placement="placement"
    :align="align"
    :padded="false"
    class="ui-tooltip"
  >
    <template #trigger>
      <span class="ui-tooltip__target">
        <slot :described-by="describedBy" />
      </span>
    </template>
    <div :id="describedBy" class="ui-tooltip__bubble" role="tooltip">
      <slot name="content">{{ content }}</slot>
    </div>
  </UiPopover>
</template>

<style scoped lang="scss">
.ui-tooltip__target {
  display: inline-flex;
  max-width: 100%;
}

.ui-tooltip__bubble {
  max-width: 16rem;
  padding: var(--ui-space-1) var(--ui-space-2);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
  line-height: 1.4;
}
</style>
