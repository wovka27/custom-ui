<script setup lang="ts">
import { ref } from 'vue'
import {
  UiAlert,
  UiBadge,
  UiButton,
  UiCluster,
  UiDialog,
  UiSeparator,
  UiSpinner,
  UiStack,
  UiTabs,
  UiTour,
  type UiTabItem,
  type UiTourStep,
} from '@/index'

const showNotice = ref(true)
const dialogOpen = ref(false)
const detailOpen = ref(false)
const confirmed = ref('')
const tab = ref('tokens')
const loading = ref(false)
const tourOpen = ref(false)
const tourNote = ref('')

const tourSteps = [
  {
    id: 'filter',
    title: 'Filter',
    description: 'Narrow the desk before you save.',
    selector: '#gallery-tour-filter',
  },
  {
    id: 'save',
    title: 'Save',
    description: 'Keep the draft on this desk.',
    selector: '#gallery-tour-save',
  },
  {
    id: 'share',
    title: 'Share',
    description: 'Send it when the draft is ready.',
    selector: '#gallery-tour-share',
  },
] as const satisfies readonly UiTourStep[]

const tabs: readonly UiTabItem[] = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'motion', label: 'Motion' },
  { id: 'legacy', label: 'Legacy', disabled: true },
]

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function confirmArchive(): void {
  confirmed.value = 'Archive confirmed.'
  dialogOpen.value = false
}

function closeBoth(): void {
  detailOpen.value = false
  dialogOpen.value = false
}

async function closeDetail(): Promise<boolean> {
  confirmed.value = 'Waiting to close the detail dialog…'
  await wait(500)
  confirmed.value = 'Detail dialog closed.'
  return true
}

async function closeArchive(): Promise<boolean> {
  confirmed.value = 'Waiting to close the archive dialog…'
  await wait(500)
  confirmed.value = 'Archive dialog closed.'
  return true
}

function toggleLoading(): void {
  loading.value = !loading.value
}

function startTour(): void {
  tourNote.value = ''
  tourOpen.value = true
}
</script>

<template>
  <section id="feedback" class="section" aria-labelledby="feedback-title">
    <UiStack gap="md">
      <header>
        <h2 id="feedback-title" class="section-title">Feedback</h2>
        <p class="lede">
          Status, tabs, dialogs that wait before closing, and a tour across the three actions.
        </p>
      </header>
      <div class="panel">
        <UiStack gap="md">
          <UiCluster>
            <UiBadge>Neutral</UiBadge>
            <UiBadge tone="accent">Accent</UiBadge>
            <UiBadge tone="success">Success</UiBadge>
            <UiBadge tone="warning">Warning</UiBadge>
            <UiBadge tone="danger">Danger</UiBadge>
            <UiSpinner label="Syncing gallery" />
          </UiCluster>
          <UiAlert
            v-if="showNotice"
            tone="warning"
            title="Review the contrast tokens"
            description="Accent and danger pairs are tuned for both themes."
            dismissible
            @dismiss="showNotice = false"
          />
          <UiAlert
            v-else
            tone="success"
            title="Notice dismissed"
            description="The live region announced the change."
          />
          <UiSeparator />
          <UiCluster>
            <UiButton @click="dialogOpen = true">Open dialog</UiButton>
            <UiButton variant="secondary" :loading="loading" @click="toggleLoading">
              {{ loading ? 'Working' : 'Toggle busy' }}
            </UiButton>
          </UiCluster>
          <p role="status" class="meta">{{ confirmed }}</p>
          <UiSeparator />
          <UiCluster justify="between">
            <UiCluster>
              <UiButton id="gallery-tour-filter" variant="secondary">Filter</UiButton>
              <UiButton id="gallery-tour-save">Save draft</UiButton>
              <UiButton id="gallery-tour-share" variant="ghost">Share</UiButton>
            </UiCluster>
            <UiButton variant="secondary" @click="startTour">Start tour</UiButton>
          </UiCluster>
          <p v-if="tourNote" role="status" class="meta">{{ tourNote }}</p>
          <UiTour v-model="tourOpen" :steps="tourSteps" @finish="tourNote = 'Tour finished.'" />
          <UiTabs v-model="tab" label="System notes" :tabs="tabs">
            <template #tokens>
              <p>Color, space, type, and focus all hang off CSS variables.</p>
            </template>
            <template #motion>
              <p>Motion is short and disabled when the user prefers reduced motion.</p>
            </template>
            <template #legacy>
              <p>This panel stays unavailable.</p>
            </template>
          </UiTabs>
        </UiStack>
      </div>
      <UiDialog
        v-model:open="dialogOpen"
        title="Archive this workspace?"
        description="Members keep read access. Closing waits, then this dialog leaves."
        :before-close="closeArchive"
      >
        <p>Nothing is deleted. The workspace leaves the active list.</p>
        <template #footer="{ close, closing }">
          <UiCluster>
            <UiButton variant="secondary" :disabled="closing" @click="close">Cancel</UiButton>
            <UiButton variant="secondary" :disabled="closing" @click="detailOpen = true">
              Review details
            </UiButton>
            <UiButton variant="danger" :loading="closing" @click="confirmArchive">
              Archive
            </UiButton>
          </UiCluster>
        </template>
      </UiDialog>
      <UiDialog
        v-model:open="detailOpen"
        title="Archive details"
        description="This dialog is on top. Discard both closes it, then the archive dialog."
        :before-close="closeDetail"
      >
        <p>Read access stays. The archive dialog underneath waits for this one.</p>
        <template #footer="{ close, closing }">
          <UiCluster>
            <UiButton variant="secondary" :disabled="closing" @click="close">Close</UiButton>
            <UiButton :loading="closing" @click="closeBoth">Discard both</UiButton>
          </UiCluster>
        </template>
      </UiDialog>
    </UiStack>
  </section>
</template>
