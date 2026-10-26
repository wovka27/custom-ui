<script setup lang="ts">
import { ref } from 'vue'
import {
  alertBox,
  confirmBox,
  showMessage,
  showNotification,
  UiAlert,
  UiBadge,
  UiBanner,
  UiButton,
  UiChip,
  UiCluster,
  UiDialog,
  UiDrawer,
  UiEmpty,
  UiPopconfirm,
  UiPopover,
  UiProgress,
  UiResult,
  UiSpinner,
  UiStack,
  UiStatus,
  UiTooltip,
  UiTour,
} from '@/index'

const { name } = defineProps<{ name: string }>()

const dialog = ref(false)
const drawer = ref(false)
const tour = ref(false)
const answer = ref('')
const steps = [
  { id: 'filter', title: 'Filter', description: 'Narrow the desk.', selector: '#tour-filter' },
  { id: 'save', title: 'Save', description: 'Keep the draft.', selector: '#tour-save' },
]

function saved(): void {
  showMessage({ title: 'Saved', description: 'The desk kept this draft.', tone: 'success' })
}

function notify(): void {
  showNotification({ title: 'Build finished', description: 'The note stayed on the right.', tone: 'info' })
}

async function ask(): Promise<void> {
  const yes = await confirmBox({ title: 'Discard the draft?' })
  answer.value = yes ? 'Discarded.' : 'Kept.'
}

async function tell(): Promise<void> {
  await alertBox({ title: 'The brief is filed.' })
  answer.value = 'Acknowledged.'
}
</script>

<template>
  <ui-alert
    v-if="name === 'UiAlert'"
    title="Filed"
    description="The brief is on the desk."
    tone="success"
    dismissible
  />

  <ui-cluster v-else-if="name === 'UiBadge'">
    <ui-badge>Neutral</ui-badge>
    <ui-badge tone="accent">Accent</ui-badge>
    <ui-badge tone="success">Success</ui-badge>
    <ui-badge tone="warning">Warning</ui-badge>
    <ui-badge tone="danger">Danger</ui-badge>
  </ui-cluster>

  <ui-banner
    v-else-if="name === 'UiBanner'"
    title="Night watch"
    description="Three berths are open."
    tone="info"
    dismissible
  />

  <ui-chip v-else-if="name === 'UiChip'" label="This week" default-selected />

  <div v-else-if="name === 'UiDialog'">
    <ui-button @click="dialog = true">Open dialog</ui-button>
    <ui-dialog v-model:open="dialog" title="Contract" description="Save the terms.">
      The witness can wait.
    </ui-dialog>
  </div>

  <div v-else-if="name === 'UiDrawer'">
    <ui-button variant="secondary" @click="drawer = true">Open drawer</ui-button>
    <ui-drawer v-model:open="drawer" title="Filters" description="Narrow the desk.">
      Status, date, and berth.
    </ui-drawer>
  </div>

  <ui-empty
    v-else-if="name === 'UiEmpty'"
    variant="panel"
    title="Nothing filed"
    description="The desk is clear."
  />

  <ui-button v-else-if="name === 'UiMessage'" variant="secondary" @click="saved">Show message</ui-button>

  <ui-stack v-else-if="name === 'UiMessageBox'" gap="sm">
    <ui-cluster>
      <ui-button variant="secondary" @click="ask">Confirm</ui-button>
      <ui-button variant="secondary" @click="tell">Alert</ui-button>
    </ui-cluster>
    <p v-if="answer" role="status">{{ answer }}</p>
  </ui-stack>

  <ui-button v-else-if="name === 'UiNotification'" variant="secondary" @click="notify">
    Show notification
  </ui-button>

  <ui-popconfirm v-else-if="name === 'UiPopconfirm'" title="Discard the draft?" @confirm="answer = 'Discarded.'">
    <template #trigger="{ toggle }">
      <ui-button variant="secondary" @click="toggle">Discard</ui-button>
    </template>
  </ui-popconfirm>

  <ui-popover v-else-if="name === 'UiPopover'">
    <template #trigger="{ open }">
      <ui-button variant="secondary" :aria-expanded="open">Note</ui-button>
    </template>
    The note sits beside the trigger.
  </ui-popover>

  <ui-stack v-else-if="name === 'UiProgress'" gap="md">
    <ui-progress variant="line" :value="64" label="Upload" />
    <ui-progress variant="circle" :value="70" label="Sync" />
  </ui-stack>

  <ui-result
    v-else-if="name === 'UiResult'"
    title="Filed"
    description="The brief left the desk."
    tone="success"
  />

  <ui-spinner v-else-if="name === 'UiSpinner'" label="Syncing" />

  <ui-status v-else-if="name === 'UiStatus'" label="Live" tone="success" pulse />

  <ui-tooltip v-else-if="name === 'UiTooltip'" content="Shown beside the trigger" placement="end">
    <template #default="{ describedBy }">
      <ui-button variant="ghost" :aria-describedby="describedBy">Hint</ui-button>
    </template>
  </ui-tooltip>

  <div v-else-if="name === 'UiTour'">
    <ui-cluster>
      <ui-button id="tour-filter" variant="secondary">Filter</ui-button>
      <ui-button id="tour-save">Save draft</ui-button>
      <ui-button variant="secondary" @click="tour = true">Start tour</ui-button>
    </ui-cluster>
    <ui-tour v-model="tour" :steps="steps" />
  </div>
</template>

<style scoped lang="scss">
p {
  margin: 0;
}
</style>
