<script setup lang="ts">
import { ref } from 'vue'
import type { WitnessMark } from '@/index'
import { UiRedact, UiWitness } from '@/index'

const { name } = defineProps<{ name: string }>()
const mark = ref<WitnessMark | null>(null)
</script>

<template>
  <ui-redact v-if="name === 'UiRedact'" label="Account" value="GB29 NWBK 6016 1331 9268 19" />
  <ui-witness
    v-else-if="name === 'UiWitness'"
    v-model="mark"
    statement="The brief reached the desk."
    signed-at="2026-10-23T04:00:00.000Z"
  />
</template>
