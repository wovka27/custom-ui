<script setup lang="ts">
import { onMounted, onScopeDispose, ref, useTemplateRef } from 'vue'

const { offset = 0 } = defineProps<{
  offset?: number
}>()

defineSlots<{
  default(): unknown
}>()

const sentinel = useTemplateRef<HTMLElement>('sentinel')
const stuck = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  const target = sentinel.value
  if (!target || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return
      stuck.value = !entry.isIntersecting && entry.boundingClientRect.top < offset
    },
    { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 1 },
  )
  observer.observe(target)
})

onScopeDispose(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="ui-affix">
    <div ref="sentinel" class="ui-affix__sentinel" />
    <div class="ui-affix__content" :data-stuck="stuck ? 'true' : undefined" :style="{ top: `${offset}px` }">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-affix__sentinel {
  height: 1px;
}

.ui-affix__content[data-stuck] {
  position: fixed;
  z-index: var(--ui-z-dropdown);
}
</style>
