<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { className, cn } from '@/lib/cn'

defineOptions({ inheritAttrs: false })

const { href, external = false } = defineProps<{
  href: string
  external?: boolean
}>()

defineSlots<{
  default(): unknown
}>()

const attrs = useAttrs()
const rel = computed(() => (external ? 'noopener noreferrer' : undefined))
const target = computed(() => (external ? '_blank' : undefined))
</script>

<template>
  <a
    v-bind="attrs"
    :class="cn('ui-link', className(attrs.class))"
    :href="href"
    :target="target"
    :rel="rel"
  >
    <slot />
    <span v-if="external" class="ui-link__hint"> (opens in a new tab)</span>
  </a>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-link {
  color: var(--ui-color-accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;

  @include focus-ring(2px);
}

.ui-link__hint {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
