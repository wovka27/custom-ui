<script setup lang="ts">
import { computed } from 'vue'
import { findComponent } from '../catalog'
import ControlsDemo from './controls.vue'
import DataDemo from './data.vue'
import DeskDemo from './desk.vue'
import FeedbackDemo from './feedback.vue'
import FormsDemo from './forms.vue'
import InstrumentsDemo from './instruments.vue'
import LayoutDemo from './layout.vue'
import PatternsDemo from './patterns.vue'
import ScoreDemo from './score.vue'

const { name } = defineProps<{ name: string }>()
const group = computed(() => findComponent(name)?.group.id)
</script>

<template>
  <forms-demo v-if="group === 'forms'" :name="name" />
  <controls-demo v-else-if="group === 'controls'" :name="name" />
  <feedback-demo v-else-if="group === 'feedback'" :name="name" />
  <data-demo v-else-if="group === 'data'" :name="name" />
  <layout-demo v-else-if="group === 'layout'" :name="name" />
  <patterns-demo v-else-if="group === 'patterns'" :name="name" />
  <instruments-demo v-else-if="group === 'instruments'" :name="name" />
  <desk-demo v-else-if="group === 'desk'" :name="name" />
  <score-demo v-else-if="group === 'score'" :name="name" />
</template>
