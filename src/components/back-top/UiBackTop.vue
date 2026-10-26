<script setup lang="ts">
import { onMounted, onScopeDispose, ref } from 'vue'

const { threshold = 240, label = 'Back to top' } = defineProps<{
  threshold?: number
  label?: string
}>()

const visible = ref(false)

function onScroll(): void {
  visible.value = window.scrollY >= threshold
}

function toTop(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onScopeDispose(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button v-if="visible" class="ui-back-top" type="button" :aria-label="label" @click="toTop">
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 12V4M4.5 7.5 8 4l3.5 3.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-back-top {
  @include icon-control(2.25rem);
  @include surface;
  @include pressable;
  position: fixed;
  z-index: var(--ui-z-dropdown);
  inset-inline-end: var(--ui-space-4);
  inset-block-end: var(--ui-space-4);
  border-radius: var(--ui-radius-full);
}
</style>
