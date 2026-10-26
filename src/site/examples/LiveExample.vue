<script setup lang="ts">
import { onErrorCaptured, ref, shallowRef, watch } from 'vue'
import type { Component, ComponentOptions } from 'vue'
import * as runtime from 'vue'
import * as kit from '@/index'

type Render = NonNullable<ComponentOptions['render']>

const { source } = defineProps<{
  source: string
}>()

function isKitComponent(value: unknown): value is Component {
  if (typeof value !== 'object' || value === null) return false
  if ('setup' in value && typeof value.setup === 'function') return true
  if ('render' in value && typeof value.render === 'function') return true
  return false
}

const registered: Record<string, Component> = {}
for (const [key, value] of Object.entries(kit)) {
  if (/^Ui[A-Z]/.test(key) && isKitComponent(value)) registered[key] = value
}

const failed = ref(false)
const view = shallowRef<Component | null>(null)

function mount(code: string): Component | null {
  if (code === '') return null
  const create = new Function('Vue', code) as (vue: typeof runtime) => Render
  return { components: registered, render: create(runtime) }
}

watch(
  () => source,
  (code) => {
    failed.value = false
    try {
      view.value = mount(code)
    } catch {
      view.value = null
      failed.value = true
    }
  },
  { immediate: true },
)

onErrorCaptured(() => {
  failed.value = true
  return false
})
</script>

<template>
  <p v-if="failed" class="miss">This preview did not mount.</p>
  <component :is="view" v-else-if="view" />
</template>

<style scoped lang="scss">
.miss {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}
</style>
