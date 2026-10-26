<script setup lang="ts">
import { ref } from 'vue'
import {
  ledgerScore,
  UiBalance,
  UiBorderBeam,
  UiButton,
  UiChord,
  UiCompare,
  UiCycle,
  UiIndex,
  UiInput,
  UiMark,
  UiPair,
  UiQrCode,
  UiScan,
  UiStack,
  UiStamp,
  UiWhisper,
} from '@/index'

const { name } = defineProps<{ name: string }>()

const chord = ref(ledgerScore)
const phase = ref('review')
const pair = ref({ start: 2, end: 8 })
const symbol = ref('berth:desk/18')
const states = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'Review' },
  { id: 'filed', label: 'Filed' },
]
const people = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
  { id: 'grace', label: 'Grace Hopper' },
]
</script>

<template>
  <ui-balance
    v-if="name === 'UiBalance'"
    :start="18"
    :end="6"
    start-label="Open"
    end-label="Closed"
  />

  <ui-border-beam v-else-if="name === 'UiBorderBeam'" mirror glow :duration="8" :radius="6">
    The brief stays inside the frame while the light walks the edge.
  </ui-border-beam>

  <ui-chord v-else-if="name === 'UiChord'" v-model="chord" label="Chord">
    <ui-stack gap="sm">
      <ui-button>Save</ui-button>
      <ui-input aria-label="Name" placeholder="Ada" />
    </ui-stack>
  </ui-chord>

  <ui-compare v-else-if="name === 'UiCompare'" label="Draft against filed">
    <template #before>Draft</template>
    <template #after>Filed</template>
  </ui-compare>

  <ui-cycle v-else-if="name === 'UiCycle'" v-model="phase" :states="states" label="Filing state" />

  <ui-index v-else-if="name === 'UiIndex'" :items="people" label="People" />

  <p v-else-if="name === 'UiMark'">
    The berth is <ui-mark>open tonight</ui-mark>.
  </p>

  <ui-pair v-else-if="name === 'UiPair'" v-model="pair" label="Berth range" :min="0" :max="12" />

  <ui-stack v-else-if="name === 'UiQrCode'" gap="sm" class="qr">
    <ui-qr-code :value="symbol" label="Berth desk" />
    <ui-input v-model="symbol" size="sm" aria-label="Data for Berth desk" placeholder="Text to scan" />
  </ui-stack>

  <ui-scan v-else-if="name === 'UiScan'" active label="Reading the brief">
    North dock, three berths, filed at dusk.
  </ui-scan>

  <ui-stamp v-else-if="name === 'UiStamp'" text="Filed" tone="success" />

  <p v-else-if="name === 'UiWhisper'">
    The
    <ui-whisper note="A berth is one mooring on the dock.">berth</ui-whisper>
    is open tonight.
  </p>
</template>

<style scoped lang="scss">
p {
  margin: 0;
}

.qr {
  width: 12rem;
}
</style>
