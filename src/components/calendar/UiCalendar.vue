<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, useTemplateRef } from 'vue'
import { Key } from '@/a11y/keys'
import { UiButton } from '@/components/button'
import { calendarDays, toIso } from '@/components/date-picker/calendar'
import { UiDialog } from '@/components/dialog'
import { UiForm, type FormValues } from '@/components/form'
import { UiSegmented } from '@/components/segmented'
import {
  useControllable,
  useModelWasPassed,
  usePropWasPassed,
} from '@/composables/use-controllable'
import type { UiOption } from '@/types/common'
import {
  calendarHeading,
  clockLabel,
  eventDay,
  eventsOnDay,
  CALENDAR_DAY_END,
  CALENDAR_DAY_START,
  hourLabels,
  isAllDay,
  nowFraction,
  placeTimed,
  shiftCursor,
  startOfWeek,
  weekBars,
  weekDates,
  type CalendarEvent,
  type CalendarView,
  type SpanBar,
  type TimedBlock,
} from './board'
import { createEventValues, editEventValues, eventForm, eventFromForm } from './event-form'

const {
  modelValue,
  defaultValue,
  view,
  defaultView = 'month',
  events = [],
  locale,
  weekStartsOn = 1,
  label = 'Calendar',
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  view?: CalendarView
  defaultView?: CalendarView
  events?: readonly CalendarEvent[]
  locale?: string
  weekStartsOn?: 0 | 1
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:view': [value: CalendarView]
  select: [value: string]
  open: [event: CalendarEvent]
  create: [event: CalendarEvent]
  update: [event: CalendarEvent]
  remove: [id: string]
}>()

defineSlots<{
  event(props: { event: CalendarEvent; time: string | null }): unknown
  empty(props: { view: CalendarView }): unknown
}>()

const viewOptions = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'agenda', label: 'Agenda' },
] as const satisfies readonly UiOption<CalendarView>[]

const hourMarks = hourLabels()
const editorOpen = ref(false)
const editorKey = ref(0)
const editorInitial = ref<FormValues | null>(null)
const editingId = ref<string | null>(null)
const seed = useId()
let created = 0
const clock = ref(new Date())
let ticker = 0

onMounted(() => {
  ticker = window.setInterval(() => {
    clock.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  window.clearInterval(ticker)
})

const datePassed = useModelWasPassed()
const viewPassed = usePropWasPassed('view')
const root = useTemplateRef<HTMLElement>('root')
const titleId = useId()
const activeLocale = computed(() => locale || globalThis.navigator?.language || 'en')
const today = computed(() => toIso(new Date()))
const dateState = useControllable({
  value: () => (datePassed() ? modelValue : undefined),
  defaultValue: () => eventDay(defaultValue ?? '') ?? today.value,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const viewState = useControllable<CalendarView>({
  value: () => (viewPassed() ? view : undefined),
  defaultValue: () => defaultView,
  onChange: (next) => {
    emit('update:view', next)
  },
})
const cursor = computed(() => eventDay(dateState.value.value) ?? today.value)
const shownView = computed(() => viewState.value.value)
const title = computed(() =>
  calendarHeading(activeLocale.value, cursor.value, shownView.value, weekStartsOn),
)
const weekdayNames = computed(() => {
  const sunday = new Date(2024, 0, 7)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday)
    date.setDate(sunday.getDate() + weekStartsOn + index)
    return new Intl.DateTimeFormat(activeLocale.value, { weekday: 'short' }).format(date)
  })
})
const period = computed(() => {
  if (shownView.value === 'week') return 'week'
  if (shownView.value === 'day') return 'day'
  return 'month'
})

interface ShownEvent {
  readonly event: CalendarEvent
  readonly time: string | null
}

interface ShownDay {
  readonly iso: string
  readonly day: number
  readonly outside: boolean
  readonly weekday: string
  readonly events: readonly ShownEvent[]
}

function present(event: CalendarEvent): ShownEvent {
  return { event, time: clockLabel(event.start) }
}

function shownEvents(iso: string): ShownEvent[] {
  return eventsOnDay(events, iso).map(present)
}

function weekdayOf(iso: string): string {
  return new Intl.DateTimeFormat(activeLocale.value, { weekday: 'short' }).format(
    new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))),
  )
}

const monthRows = computed(() => {
  const date = eventDay(cursor.value)
  if (!date) return []
  const cells = calendarDays(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    weekStartsOn,
  ).map((day) => ({
    iso: day.iso,
    day: day.day,
    outside: day.outside,
    weekday: '',
    events: shownEvents(day.iso).filter((item) => !isAllDay(item.event)),
  }))
  const rows: { id: string; days: ShownDay[]; bars: SpanBar[] }[] = []
  for (let index = 0; index < cells.length; index += 7) {
    const days = cells.slice(index, index + 7)
    const id = days[0]?.iso ?? String(index)
    rows.push({
      id,
      days,
      bars: weekBars(
        events,
        days.map((day) => day.iso),
      ),
    })
  }
  return rows
})

const scheduleDays = computed(() => {
  const dates = shownView.value === 'day' ? [cursor.value] : weekDates(cursor.value, weekStartsOn)
  return dates.map((iso) => ({
    iso,
    day: Number(iso.slice(8, 10)),
    weekday: weekdayOf(iso),
    blocks: placeTimed(events, iso),
  }))
})

const scheduleBars = computed(() =>
  weekBars(
    events,
    scheduleDays.value.map((day) => day.iso),
  ),
)
const scheduleVars = computed(() => ({
  '--_days': String(scheduleDays.value.length),
  '--_hours': String(hourMarks.length),
}))
const now = computed(() => nowFraction(clock.value))

const agenda = computed(() => {
  const date = eventDay(cursor.value)
  if (!date) return []
  return calendarDays(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, weekStartsOn)
    .filter((day) => !day.outside)
    .map((day) => ({
      iso: day.iso,
      label: new Intl.DateTimeFormat(activeLocale.value, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date(Number(day.iso.slice(0, 4)), Number(day.iso.slice(5, 7)) - 1, day.day)),
      events: shownEvents(day.iso),
    }))
    .filter((day) => day.events.length > 0)
})

function choose(iso: string): void {
  const day = eventDay(iso)
  if (!day) return
  dateState.setValue(day)
  emit('select', day)
}

const editorTitle = computed(() => (editingId.value ? 'Edit event' : 'New event'))

function openEditor(initial: FormValues, id: string | null): void {
  editingId.value = id
  editorInitial.value = initial
  editorKey.value += 1
  editorOpen.value = true
}

function openEvent(item: CalendarEvent, iso: string): void {
  choose(iso)
  openEditor(editEventValues(item), item.id)
  emit('open', item)
}

function saveEvent(values: FormValues): void {
  if (!editorOpen.value) return
  const id = editingId.value ?? `${seed}-${++created}`
  const next = eventFromForm(id, values)
  if (!next) return
  editorOpen.value = false
  if (editingId.value) emit('update', next)
  else emit('create', next)
}

function removeEditing(): void {
  const id = editingId.value
  if (!id) return
  editorOpen.value = false
  emit('remove', id)
}

function blockStyle(block: TimedBlock): Record<string, string> {
  const span = CALENDAR_DAY_END - CALENDAR_DAY_START
  const top = ((block.start - CALENDAR_DAY_START) / span) * 100
  const height = ((block.end - block.start) / span) * 100
  const width = 100 / block.columns
  const left = block.column * width
  return {
    top: `${top}%`,
    height: `${height}%`,
    insetInlineStart: `calc(${left}% + 1px)`,
    width: `calc(${width}% - 2px)`,
  }
}

function barStyle(bar: SpanBar): Record<string, string> {
  return { gridColumn: `${bar.start + 1} / span ${bar.span}` }
}

function onLane(event: MouseEvent, iso: string): void {
  if (!(event.currentTarget instanceof HTMLElement)) return
  const target = event.target
  const element =
    target instanceof HTMLElement ? target : target instanceof Node ? target.parentElement : null
  if (element?.closest('button')) return
  const bounds = event.currentTarget.getBoundingClientRect()
  if (bounds.height <= 0) return
  const ratio = (event.clientY - bounds.top) / bounds.height
  if (!Number.isFinite(ratio)) return
  const minutes = Math.min(
    CALENDAR_DAY_END - 30,
    Math.max(
      CALENDAR_DAY_START,
      CALENDAR_DAY_START + Math.round((ratio * (CALENDAR_DAY_END - CALENDAR_DAY_START)) / 30) * 30,
    ),
  )
  const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  choose(iso)
  openEditor(createEventValues(iso, time), null)
}

function openDay(iso: string): void {
  choose(iso)
  viewState.setValue('day')
}

function move(amount: number): void {
  dateState.setValue(shiftCursor(cursor.value, shownView.value, amount))
}

function setView(value: string | number): void {
  if (value === 'month' || value === 'week' || value === 'day' || value === 'agenda') {
    viewState.setValue(value)
  }
}

async function focusSelected(): Promise<void> {
  await nextTick()
  root.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus()
}

function onGridKey(event: KeyboardEvent, iso: string): void {
  let next: string | null = null
  if (event.key === Key.ArrowLeft) next = shiftCursor(iso, 'day', -1)
  else if (event.key === Key.ArrowRight) next = shiftCursor(iso, 'day', 1)
  else if (event.key === Key.ArrowUp)
    next = shiftCursor(iso, 'day', shownView.value === 'month' ? -7 : -1)
  else if (event.key === Key.ArrowDown)
    next = shiftCursor(iso, 'day', shownView.value === 'month' ? 7 : 1)
  else if (event.key === Key.Home) next = startOfWeek(iso, weekStartsOn)
  else if (event.key === Key.End) next = shiftCursor(startOfWeek(iso, weekStartsOn), 'day', 6)
  else if (event.key === Key.PageUp) next = shiftCursor(iso, shownView.value, -1)
  else if (event.key === Key.PageDown) next = shiftCursor(iso, shownView.value, 1)
  if (!next || next === cursor.value) return
  event.preventDefault()
  dateState.setValue(next)
  void focusSelected()
}

function eventName(item: ShownEvent): string {
  return item.time ? `${item.event.title}, ${item.time}` : `${item.event.title}, all day`
}
</script>

<template>
  <section ref="root" class="ui-calendar" :aria-label="label">
    <div class="ui-calendar__bar">
      <div class="ui-calendar__nav">
        <ui-button
          variant="secondary"
          size="sm"
          :aria-label="`Previous ${period}`"
          @click="move(-1)"
        >
          Previous
        </ui-button>
        <ui-button variant="secondary" size="sm" @click="dateState.setValue(today)">Today</ui-button>
        <ui-button variant="secondary" size="sm" :aria-label="`Next ${period}`" @click="move(1)">
          Next
        </ui-button>
      </div>
      <p :id="titleId" class="ui-calendar__title">{{ title }}</p>
      <ui-segmented
        :model-value="shownView"
        :options="viewOptions"
        size="sm"
        label="Calendar view"
        @update:model-value="setView"
      />
    </div>

    <ui-dialog
      v-model:open="editorOpen"
      :title="editorTitle"
      description="When, how long, and how it reads."
      size="md"
    >
      <ui-form
        v-if="editorInitial"
        :key="editorKey"
        :schema="eventForm"
        :initial="editorInitial"
        label="Event"
        submit-label="Save"
        columns="12rem"
        @submit="saveEvent"
      />
      <template v-if="editingId" #footer>
        <ui-button variant="danger" @click="removeEditing">Remove</ui-button>
      </template>
    </ui-dialog>

    <div
      v-if="shownView === 'month'"
      class="ui-calendar__month"
      role="grid"
      :aria-labelledby="titleId"
    >
      <div class="ui-calendar__weekdays" role="row">
        <span v-for="name in weekdayNames" :key="name" role="columnheader">{{ name }}</span>
      </div>
      <div v-for="row in monthRows" :key="row.id" class="ui-calendar__row" role="row">
        <div
          v-for="day in row.days"
          :key="day.iso"
          class="ui-calendar__cell"
          role="gridcell"
          :tabindex="day.iso === cursor ? 0 : -1"
          :aria-selected="day.iso === cursor"
          :aria-current="day.iso === today ? 'date' : undefined"
          :data-outside="day.outside || undefined"
          @click="choose(day.iso)"
          @keydown="onGridKey($event, day.iso)"
        >
          <span class="ui-calendar__num">{{ day.day }}</span>
          <button
            v-for="item in day.events.slice(0, 2)"
            :key="item.event.id"
            type="button"
            class="ui-calendar__event"
            :data-tone="item.event.tone ?? 'neutral'"
            :aria-label="eventName(item)"
            @click.stop="openEvent(item.event, day.iso)"
          >
            <span v-if="item.time" class="ui-calendar__clock">{{ item.time }}</span>
            <slot name="event" :event="item.event" :time="item.time">{{ item.event.title }}</slot>
          </button>
          <span v-if="day.events.length > 2" class="ui-calendar__more"
            >+{{ day.events.length - 2 }}</span
          >
        </div>
        <div v-if="row.bars.length > 0" class="ui-calendar__span">
          <button
            v-for="bar in row.bars"
            :key="bar.event.id"
            type="button"
            class="ui-calendar__event"
            :style="barStyle(bar)"
            :data-tone="bar.event.tone ?? 'neutral'"
            :data-before="bar.continuesBefore || undefined"
            :data-after="bar.continuesAfter || undefined"
            :aria-label="`${bar.event.title}, all day`"
            @click.stop="openEvent(bar.event, row.days[bar.start]?.iso ?? cursor)"
          >
            {{ bar.event.title }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="shownView === 'week' || shownView === 'day'" class="ui-calendar__frame">
      <div
        class="ui-calendar__schedule"
        :data-view="shownView"
        :style="scheduleVars"
        role="grid"
        :aria-labelledby="titleId"
      >
        <div class="ui-calendar__days" role="row">
          <span class="ui-calendar__gutter" />
          <button
            v-for="column in scheduleDays"
            :key="column.iso"
            type="button"
            class="ui-calendar__dayhead"
            role="gridcell"
            :tabindex="column.iso === cursor ? 0 : -1"
            :aria-selected="column.iso === cursor"
            :aria-current="column.iso === today ? 'date' : undefined"
            @click="choose(column.iso)"
            @keydown="onGridKey($event, column.iso)"
          >
            <span class="ui-calendar__weekday">{{ column.weekday }}</span>
            <span class="ui-calendar__num">{{ column.day }}</span>
          </button>
        </div>
        <div v-if="scheduleBars.length > 0" class="ui-calendar__allday">
          <span class="ui-calendar__gutter">All day</span>
          <div class="ui-calendar__bars">
            <button
              v-for="bar in scheduleBars"
              :key="bar.event.id"
              type="button"
              class="ui-calendar__event"
              :style="barStyle(bar)"
              :data-tone="bar.event.tone ?? 'neutral'"
              :data-before="bar.continuesBefore || undefined"
              :data-after="bar.continuesAfter || undefined"
              :aria-label="`${bar.event.title}, all day`"
              @click="openEvent(bar.event, scheduleDays[bar.start]?.iso ?? cursor)"
            >
              {{ bar.event.title }}
            </button>
          </div>
        </div>
        <div class="ui-calendar__hours">
          <div class="ui-calendar__scale" aria-hidden="true">
            <span
              v-for="(mark, index) in hourMarks"
              :key="mark"
              :style="{ top: `${(index / hourMarks.length) * 100}%` }"
            >
              {{ mark }}
            </span>
          </div>
          <div class="ui-calendar__lanes">
            <div
              v-for="column in scheduleDays"
              :key="column.iso"
              class="ui-calendar__lane"
              :data-selected="column.iso === cursor || undefined"
              @click="onLane($event, column.iso)"
            >
              <button
                v-for="block in column.blocks"
                :key="block.event.id"
                type="button"
                class="ui-calendar__block"
                :style="blockStyle(block)"
                :data-tone="block.event.tone ?? 'neutral'"
                :aria-label="`${block.event.title}, ${clockLabel(block.event.start) ?? ''}`"
                @click.stop="openEvent(block.event, column.iso)"
              >
                <slot name="event" :event="block.event" :time="clockLabel(block.event.start)">
                  {{ block.event.title }}
                </slot>
              </button>
              <span
                v-if="column.iso === today && now !== null"
                class="ui-calendar__now"
                :style="{ top: `${now * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="ui-calendar__agenda">
      <p v-if="agenda.length === 0" class="ui-calendar__empty">
        <slot name="empty" :view="shownView">Nothing in this month.</slot>
      </p>
      <ol v-else>
        <li v-for="group in agenda" :key="group.iso">
          <button type="button" class="ui-calendar__day-jump" @click="openDay(group.iso)">
            {{ group.label }}
          </button>
          <button
            v-for="item in group.events"
            :key="item.event.id"
            type="button"
            class="ui-calendar__entry"
            :data-tone="item.event.tone ?? 'neutral'"
            :aria-label="eventName(item)"
            @click="openEvent(item.event, group.iso)"
          >
            <span v-if="item.time" class="ui-calendar__clock">{{ item.time }}</span>
            <slot name="event" :event="item.event" :time="item.time">{{ item.event.title }}</slot>
          </button>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-calendar {
  @include surface;
  display: grid;
  gap: var(--ui-space-4);
  padding: var(--ui-space-4);
}

.ui-calendar__bar,
.ui-calendar__nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
}

.ui-calendar__bar {
  justify-content: space-between;
}

.ui-calendar__title {
  margin: 0;
  font-size: var(--ui-font-size-lg);
}

.ui-calendar__weekdays,
.ui-calendar__row,
.ui-calendar__week-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.ui-calendar__weekdays {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-calendar__weekdays span,
.ui-calendar__cell,
.ui-calendar__column {
  padding: var(--ui-space-2);
}

.ui-calendar__cell,
.ui-calendar__column {
  @include focus-ring(2px);
  display: grid;
  align-content: start;
  gap: var(--ui-space-1);
  min-width: 0;
  min-height: 5.75rem;
  border-top: 1px solid var(--ui-color-border);
  border-inline-end: 1px solid var(--ui-color-border);
  cursor: pointer;
}

.ui-calendar__column {
  min-height: 12rem;
}

.ui-calendar__cell[aria-selected='true'],
.ui-calendar__column[aria-selected='true'] {
  background: var(--ui-color-accent-subtle);
  box-shadow: inset 0 0 0 1px var(--ui-color-accent);
}

.ui-calendar__cell[data-outside='true'] {
  color: var(--ui-color-muted);
}

.ui-calendar__cell[aria-current='date'] .ui-calendar__num,
.ui-calendar__column[aria-current='date'] .ui-calendar__num {
  color: var(--ui-color-accent);
  font-weight: 600;
}

.ui-calendar__num,
.ui-calendar__weekday {
  font-size: var(--ui-font-size-sm);
}

.ui-calendar__weekday {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-calendar__event,
.ui-calendar__entry,
.ui-calendar__day-jump {
  @include focus-ring(1px);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-subtle);
  color: var(--ui-color-fg);
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.ui-calendar__event {
  @include truncate;
  width: 100%;
  padding: 0.1rem 0.35rem;
  font-size: var(--ui-font-size-xs);
}

.ui-calendar__event[data-tone='accent'],
.ui-calendar__entry[data-tone='accent'] {
  border-color: var(--ui-color-accent);
  background: var(--ui-color-accent-subtle);
}

.ui-calendar__event[data-tone='success'],
.ui-calendar__entry[data-tone='success'] {
  border-color: var(--ui-color-success);
  background: var(--ui-color-success-subtle);
}

.ui-calendar__event[data-tone='warning'],
.ui-calendar__entry[data-tone='warning'] {
  border-color: var(--ui-color-warning);
  background: var(--ui-color-warning-subtle);
}

.ui-calendar__event[data-tone='danger'],
.ui-calendar__entry[data-tone='danger'] {
  border-color: var(--ui-color-danger);
  background: var(--ui-color-danger-subtle);
}

.ui-calendar__more,
.ui-calendar__clock,
.ui-calendar__detail,
.ui-calendar__empty {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-calendar__event .ui-calendar__clock {
  margin-inline-end: 0.35rem;
}

.ui-calendar__frame {
  overflow: auto;
}

.ui-calendar__schedule[data-view='week'] {
  min-width: 44rem;
}

.ui-calendar__days,
.ui-calendar__allday,
.ui-calendar__hours {
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 1fr);
}

.ui-calendar__days {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--ui-color-surface);
}

.ui-calendar__dayhead {
  @include focus-ring(2px);
  display: grid;
  justify-items: center;
  gap: 0.1rem;
  padding: var(--ui-space-2);
  border: 0;
  border-bottom: 1px solid var(--ui-color-border);
  background: transparent;
  color: var(--ui-color-fg);
  font: inherit;
  cursor: pointer;
}

.ui-calendar__dayhead[aria-selected='true'] {
  background: var(--ui-color-accent-subtle);
  box-shadow: inset 0 -2px 0 var(--ui-color-accent);
}

.ui-calendar__gutter {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-calendar__allday {
  align-items: center;
  gap: var(--ui-space-1);
  padding-block: var(--ui-space-1);
}

.ui-calendar__bars,
.ui-calendar__lanes,
.ui-calendar__days {
  display: grid;
}

.ui-calendar__days {
  grid-template-columns: 3.25rem repeat(var(--_days), minmax(0, 1fr));
}

.ui-calendar__bars {
  grid-template-columns: repeat(var(--_days), minmax(0, 1fr));
  gap: 0.2rem;
}

.ui-calendar__bars .ui-calendar__event,
.ui-calendar__span .ui-calendar__event {
  width: 100%;
}

.ui-calendar__hours {
  max-height: 28rem;
  overflow: auto;
}

.ui-calendar__scale,
.ui-calendar__lane {
  position: relative;
  height: calc(var(--_hours) * 3rem);
}

.ui-calendar__scale span {
  position: absolute;
  inset-inline-start: 0;
  color: var(--ui-color-muted);
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
  line-height: 1;
}

.ui-calendar__lanes {
  grid-template-columns: repeat(var(--_days), minmax(0, 1fr));
}

.ui-calendar__lane {
  background-image: repeating-linear-gradient(
    to bottom,
    var(--ui-color-border) 0,
    var(--ui-color-border) 1px,
    transparent 1px,
    transparent calc(100% / var(--_hours))
  );
  cursor: pointer;
}

.ui-calendar__lane[data-selected='true'] {
  background-color: var(--ui-color-accent-subtle);
}

.ui-calendar__block {
  @include focus-ring(1px);
  position: absolute;
  overflow: hidden;
  min-height: 1.35rem;
  padding: 0.15rem 0.35rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-subtle);
  color: var(--ui-color-fg);
  font: inherit;
  font-size: var(--ui-font-size-xs);
  text-align: start;
  cursor: pointer;
}

.ui-calendar__block[data-tone='accent'] {
  border-color: var(--ui-color-accent);
  background: var(--ui-color-accent-subtle);
}

.ui-calendar__block[data-tone='success'] {
  border-color: var(--ui-color-success);
  background: var(--ui-color-success-subtle);
}

.ui-calendar__block[data-tone='warning'] {
  border-color: var(--ui-color-warning);
  background: var(--ui-color-warning-subtle);
}

.ui-calendar__block[data-tone='danger'] {
  border-color: var(--ui-color-danger);
  background: var(--ui-color-danger-subtle);
}

.ui-calendar__now {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  border-top: 1px solid var(--ui-color-danger);
  pointer-events: none;
}

.ui-calendar__now::before {
  content: '';
  position: absolute;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-danger);
  transform: translate(-40%, -50%);
}

.ui-calendar__span {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.2rem;
  padding-block: 0.15rem;
}

.ui-calendar__event[data-before='true'] {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

.ui-calendar__event[data-after='true'] {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

.ui-calendar__agenda ol {
  display: grid;
  gap: var(--ui-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-calendar__agenda li {
  display: grid;
  gap: var(--ui-space-2);
}

.ui-calendar__entry,
.ui-calendar__day-jump {
  display: grid;
  gap: 0.15rem;
  padding: var(--ui-space-2) var(--ui-space-3);
}

.ui-calendar__when {
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-sm);
}

.ui-calendar__empty {
  margin: 0;
  font-size: var(--ui-font-size-sm);
}

@media (max-width: 48rem) {
  .ui-calendar__cell {
    min-height: 4.25rem;
    padding: var(--ui-space-1);
  }
}
</style>
