<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref } from 'vue'
import { formatRemaining } from './format'

const { endsAt, label = 'Time remaining' } = defineProps<{
  endsAt: number
  label?: string
}>()

const emit = defineEmits<{
  finish: []
}>()

defineSlots<{
  default(props: { remaining: string; finished: boolean }): unknown
}>()

const now = ref(Date.now())
const finished = ref(false)
let timer = 0

const remainingMs = computed(() => endsAt - now.value)
const text = computed(() => formatRemaining(remainingMs.value))

function tick(): void {
  now.value = Date.now()
  if (remainingMs.value <= 0 && !finished.value) {
    finished.value = true
    emit('finish')
  }
}

onMounted(() => {
  tick()
  timer = window.setInterval(tick, 1000)
})

onScopeDispose(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <time class="ui-countdown" :datetime="new Date(endsAt).toISOString()" :aria-label="label">
    <slot :remaining="text" :finished="finished">{{ text }}</slot>
  </time>
</template>

<style scoped lang="scss">
.ui-countdown {
  font-family: var(--ui-font-mono);
  font-variant-numeric: tabular-nums;
  font-size: var(--ui-font-size-sm);
}
</style>
