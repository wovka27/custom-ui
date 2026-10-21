<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton,
  UiCarousel,
  UiDateTimePicker,
  UiTimeline,
  UiCluster,
  UiCollapse,
  UiCollapseItem,
  UiColorPicker,
  UiDatePicker,
  UiDivider,
  UiGrid,
  UiImage,
  UiInputOtp,
  UiInputTag,
  UiMessage,
  UiNotification,
  UiPopover,
  UiProgress,
  UiSegmented,
  UiSlider,
  UiStack,
  UiTooltip,
  UiUpload,
  showMessage,
  showNotification,
  type UiDateValue,
} from '@/index'

const volume = ref(40)
const window = ref<[number, number]>([24, 76])
const scaleMin = ref(0)
const scaleMax = ref(100)
const tight = ref(false)
const color = ref('#3f9d6a')
const when = ref<UiDateValue>('2026-10-21')
const stay = ref<UiDateValue>({ start: '2026-10-21', end: '2026-10-24' })
const slot = ref<UiDateValue>('2026-10-21T09:30')
const span = ref<UiDateValue>({ start: null, end: null })
const day = [
  { id: 'filed', time: '09:10', title: 'Filed', description: 'The brief reached the desk.' },
  { id: 'review', time: '11:40', title: 'Review', description: 'Ada marked two lines.' },
  { id: 'sent', time: '16:05', title: 'Sent', description: 'The client received the proof.' },
] as const
const names = ref<string[]>(['Ada'])
const mode = ref<string | number>('week')

const modes = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
] as const

const preview =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#123"/><text x="32" y="180" fill="#e8e8e8" font-size="32">Harbor</text></svg>',
  )

function setVolume(value: number | readonly [number, number]): void {
  if (typeof value === 'number') volume.value = value
}

function setWindow(value: number | readonly [number, number]): void {
  if (Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number') {
    window.value = [value[0], value[1]]
  }
}

function toggleScale(): void {
  tight.value = !tight.value
  scaleMin.value = tight.value ? 20 : 0
  scaleMax.value = tight.value ? 80 : 100
}

function notify(): void {
  showNotification({
    title: 'Build finished',
    description: 'The gallery kept this note.',
    tone: 'info',
  })
}

function saved(): void {
  showMessage({ title: 'Saved', description: 'The desk kept this draft.', tone: 'success' })
}
</script>

<template>
  <section id="controls" class="section" aria-labelledby="controls-title">
    <UiMessage />
    <UiNotification />
    <UiStack gap="md">
      <header>
        <h2 id="controls-title" class="section-title">Controls</h2>
        <p class="lede">
          Range slider, carousel pages, and the controls added after the first gallery.
        </p>
      </header>
      <div class="panel">
        <UiStack gap="md">
          <div>
            <p class="meta">Volume {{ volume }}</p>
            <UiSlider :model-value="volume" label="Volume" @update:model-value="setVolume" />
          </div>
          <div>
            <p class="meta">
              Window {{ window[0] }} – {{ window[1] }} on a {{ scaleMin }} to {{ scaleMax }} scale
            </p>
            <UiSlider
              :model-value="window"
              range
              :min="scaleMin"
              :max="scaleMax"
              label="Window"
              @update:model-value="setWindow"
            />
            <UiButton size="sm" variant="secondary" @click="toggleScale">
              {{ tight ? 'Restore the scale' : 'Tighten the scale' }}
            </UiButton>
          </div>
        </UiStack>
      </div>
      <UiGrid class="frames" min-column="18rem">
        <div class="panel">
          <p class="meta">Dots, click</p>
          <UiCarousel label="Dots" pagination="dots" pagination-trigger="click">
            <article>One</article>
            <article>Two</article>
            <article>Three</article>
          </UiCarousel>
        </div>
        <div class="panel">
          <p class="meta">Line, hover</p>
          <UiCarousel label="Lines" pagination="line" pagination-trigger="hover" controls="none">
            <article>One</article>
            <article>Two</article>
            <article>Three</article>
          </UiCarousel>
        </div>
      </UiGrid>
      <div class="panel">
        <UiStack gap="md">
          <UiCluster>
            <UiDatePicker v-model="when" />
            <UiDatePicker v-model="stay" range placeholder="Start and end" />
            <UiDateTimePicker v-model="slot" />
            <UiDateTimePicker v-model="span" range placeholder="Start and end" />
            <UiColorPicker v-model="color" />
            <UiColorPicker v-model="color" variant="swatches" label="Swatches" />
            <UiSegmented v-model="mode" :options="modes" label="Range" />
          </UiCluster>
          <UiInputTag v-model="names" placeholder="Name" />
          <UiInputOtp label="Code" />
          <UiGrid min-column="12rem">
            <UiProgress variant="line" :value="64" label="Upload" />
            <UiProgress variant="circle" :value="70" label="Sync" />
            <UiProgress variant="steps" :value="40" label="Review" show-value />
          </UiGrid>
          <UiDivider>Or continue</UiDivider>
          <UiCluster>
            <UiPopover>
              <template #trigger="{ open }">
                <UiButton variant="secondary" :aria-expanded="open">Popover</UiButton>
              </template>
              Anchored to this button.
            </UiPopover>
            <UiTooltip content="Shown beside the trigger" placement="end">
              <template #default="{ describedBy }">
                <UiButton variant="ghost" :aria-describedby="describedBy">Tooltip</UiButton>
              </template>
            </UiTooltip>
            <UiButton variant="secondary" @click="notify">Notify</UiButton>
            <UiButton variant="secondary" @click="saved">Message</UiButton>
          </UiCluster>
          <UiCollapse :default-value="['one']">
            <UiCollapseItem name="one" title="Schedule">The desk opens at nine.</UiCollapseItem>
            <UiCollapseItem name="two" title="Crew">Ada, Lin, and Mio.</UiCollapseItem>
          </UiCollapse>
          <UiGrid min-column="14rem">
            <UiImage :src="preview" alt="Harbor" ratio="16 / 9" />
            <UiUpload label="Drop a file" />
            <UiTimeline :items="day" label="Desk day" />
          </UiGrid>
        </UiStack>
      </div>
    </UiStack>
  </section>
</template>

<style scoped lang="scss">
article {
  display: grid;
  place-items: center;
  min-height: 8rem;
}

.frames :deep(.ui-carousel) {
  width: 100%;
}
</style>
