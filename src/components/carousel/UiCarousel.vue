<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, useTemplateRef } from 'vue'
import { Key } from '@/a11y/keys'
import { useControllable } from '@/composables/use-controllable'

export type UiCarouselControls = 'inside' | 'top' | 'bottom' | 'none'
export type UiCarouselPagination = 'dots' | 'line' | 'none'
export type UiCarouselPageTrigger = 'click' | 'hover'

const {
  modelValue,
  defaultValue = 0,
  label,
  loop = false,
  controls = 'inside',
  pagination = 'dots',
  paginationTrigger = 'click',
} = defineProps<{
  modelValue?: number
  defaultValue?: number
  label: string
  loop?: boolean
  controls?: UiCarouselControls
  pagination?: UiCarouselPagination
  paginationTrigger?: UiCarouselPageTrigger
}>()

const emit = defineEmits<{
  'update:modelValue': [index: number]
}>()

defineSlots<{
  default(): unknown
}>()

const trackRef = useTemplateRef<HTMLElement>('track')
const count = ref(0)
const pages = computed(() => Array.from({ length: count.value }, (_, index) => index))
const state = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

function measure(): void {
  count.value = trackRef.value?.childElementCount ?? 0
}

function scrollTo(index: number): void {
  const track = trackRef.value
  const child = track?.children.item(index)
  if (!track || !(child instanceof HTMLElement)) return
  track.scrollTo({ left: child.offsetLeft, behavior: 'smooth' })
}

function go(next: number): void {
  if (count.value === 0) return
  const index = loop
    ? (next + count.value) % count.value
    : Math.min(count.value - 1, Math.max(0, next))
  state.setValue(index)
  scrollTo(index)
}

function onScroll(): void {
  const track = trackRef.value
  if (!track || track.clientWidth === 0) return
  const index = Math.round(track.scrollLeft / track.clientWidth)
  if (index !== state.value.value) state.setValue(index)
}

function onPage(index: number): void {
  go(index)
}

function onPageHover(index: number): void {
  if (paginationTrigger !== 'hover') return
  go(index)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === Key.ArrowRight) go(state.value.value + 1)
  else if (event.key === Key.ArrowLeft) go(state.value.value - 1)
  else return
  event.preventDefault()
}

onMounted(measure)
onUpdated(measure)
</script>

<template>
  <section
    class="ui-carousel"
    :data-controls="controls"
    :aria-roledescription="'carousel'"
    :aria-label="label"
    @keydown="onKeydown"
  >
    <div class="ui-carousel__frame">
      <div ref="track" class="ui-carousel__track" tabindex="0" @scroll="onScroll">
        <slot />
      </div>
      <div
        v-if="pagination !== 'none' && pages.length > 0"
        class="ui-carousel__pages"
        :data-variant="pagination"
        role="group"
        :aria-label="`${label} pages`"
      >
        <button
          v-for="index in pages"
          :key="index"
          type="button"
          class="ui-carousel__page"
          :aria-label="`Show slide ${index + 1}`"
          :aria-current="state.value.value === index ? 'true' : undefined"
          @click="onPage(index)"
          @pointerenter="onPageHover(index)"
        />
      </div>
    </div>
    <div v-if="controls !== 'none'" class="ui-carousel__nav">
      <button
        type="button"
        aria-label="Previous slide"
        :disabled="!loop && state.value.value <= 0"
        @click="go(state.value.value - 1)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M10 4 6 8l4 4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span v-if="pagination === 'none'" class="ui-carousel__count"
        >{{ count === 0 ? 0 : state.value.value + 1 }} / {{ count }}</span
      >
      <button
        type="button"
        aria-label="Next slide"
        :disabled="!loop && state.value.value >= count - 1"
        @click="go(state.value.value + 1)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="m6 4 4 4-4 4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ui-carousel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  width: 100%;
  min-width: 0;
}

.ui-carousel__frame {
  position: relative;
  min-width: 0;
}

.ui-carousel__track {
  position: relative;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);

  &::-webkit-scrollbar {
    display: none;
  }

  > :deep(*) {
    flex: 0 0 100%;
    min-height: 8rem;
    scroll-snap-align: start;
  }
}

.ui-carousel__nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-variant-numeric: tabular-nums;
}

.ui-carousel[data-controls='top'] .ui-carousel__nav {
  order: -1;
}

.ui-carousel[data-controls='inside'] .ui-carousel__nav {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding-inline: var(--ui-space-2);
  pointer-events: none;
}

.ui-carousel[data-controls='inside'] .ui-carousel__count {
  justify-self: center;
  align-self: end;
  margin-block-end: var(--ui-space-2);
  padding-inline: var(--ui-space-2);
  color: var(--ui-color-fg);
}

.ui-carousel__count {
  min-width: 2.5rem;
  text-align: center;
}

button {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: var(--ui-color-fg);
  cursor: pointer;

  svg {
    width: 0.9rem;
    height: 0.9rem;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}

.ui-carousel[data-controls='inside'] .ui-carousel__nav > button:last-of-type {
  grid-column: 3;
}

.ui-carousel[data-controls='inside'] button:not(.ui-carousel__page) {
  background: var(--ui-color-surface);
  pointer-events: auto;
}

.ui-carousel__pages {
  position: absolute;
  z-index: 2;
  inset-inline: var(--ui-space-2);
  inset-block-end: var(--ui-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
}

.ui-carousel__page {
  width: 0.4rem;
  height: 0.4rem;
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-border-strong);
  pointer-events: auto;
  cursor: pointer;

  &[aria-current='true'] {
    background: var(--ui-color-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}

.ui-carousel__pages[data-variant='line'] {
  gap: 4px;
}

.ui-carousel__pages[data-variant='line'] .ui-carousel__page {
  width: 1.15rem;
  height: 2px;
  transition:
    width var(--ui-duration) var(--ui-ease),
    background-color var(--ui-duration) var(--ui-ease);

  &[aria-current='true'] {
    width: 1.75rem;
  }
}
</style>
