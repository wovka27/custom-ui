<script setup lang="ts" generic="T extends string | number, O extends UiOption<T> = UiOption<T>">
import { computed, nextTick, onScopeDispose, ref, useId, useTemplateRef, watch } from 'vue'
import type { UiOption, UiSize } from '@/types/common'
import { UiSpinner } from '@/components/spinner'
import { Key } from '@/a11y/keys'
import { useAnchoredPosition } from '@/composables/use-anchored-position'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'
import { nextEnabledIndex } from '@/lib/dom'
import { withAllOption, type UiSelectAllOption, type ResolvedSelectOption } from './select-all'

const {
  modelValue,
  defaultValue,
  options,
  allOption,
  placeholder = 'Select an option',
  size = 'md',
  id,
  name,
  disabled,
  invalid,
  required,
  busy = false,
  hasMore = false,
  loadingMore = false,
} = defineProps<{
  modelValue?: T | null
  defaultValue?: T | null
  options: readonly O[]
  allOption?: boolean | UiSelectAllOption<T>
  placeholder?: string
  size?: UiSize
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  busy?: boolean
  hasMore?: boolean
  loadingMore?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T | null]
  change: [value: T | null]
  'load-more': []
}>()

defineSlots<{
  option?(props: {
    option: O | ResolvedSelectOption<T>
    selected: boolean
    active: boolean
  }): unknown
  value?(props: { option: (O | ResolvedSelectOption<T>) | undefined }): unknown
  empty?(): unknown
  footer?(props: { hasMore: boolean; loading: boolean }): unknown
}>()

const listId = useId()
const open = ref(false)
const activeIndex = ref(0)
const typeBuffer = ref('')
const rootRef = useTemplateRef<HTMLElement>('root')
const buttonRef = useTemplateRef<HTMLButtonElement>('button')
const listRef = useTemplateRef<HTMLElement>('list')
const moreRef = useTemplateRef<HTMLElement>('more')
let typeTimer = 0
let moreObserver: IntersectionObserver | undefined
const waitingForPage = ref(false)

const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => required,
})
const state = useControllable<T | null | undefined>({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    if (next === undefined) return
    emit('update:modelValue', next)
    emit('change', next)
  },
})
const items = computed(() => withAllOption(options, allOption))
const position = useAnchoredPosition(
  () => buttonRef.value,
  () => listRef.value,
)

const selected = computed(() => items.value.find((option) => option.value === state.value.value))
const activeOption = computed(() => items.value[activeIndex.value])
const activeId = computed(() =>
  activeOption.value ? optionId(activeOption.value.value) : undefined,
)

function optionId(value: T | null): string {
  return value === null ? `${listId}-opt-all` : `${listId}-opt-${String(value)}`
}

function isDisabled(index: number): boolean {
  return items.value[index]?.disabled === true
}

function syncActive(): void {
  const selectedIndex = items.value.findIndex((option) => option.value === state.value.value)
  const start = selectedIndex >= 0 ? selectedIndex : 0
  const resolved = nextEnabledIndex(items.value.length, start, 1, isDisabled)
  activeIndex.value = resolved >= 0 ? resolved : 0
}

function show(): void {
  const list = listRef.value
  if (!list || field.isDisabled.value) return
  list.showPopover()
  open.value = true
  syncActive()
  void nextTick(() => position.update())
}

function hide(): void {
  listRef.value?.hidePopover()
  open.value = false
  typeBuffer.value = ''
}

function toggle(): void {
  if (open.value) hide()
  else show()
}

function choose(option: (O | ResolvedSelectOption<T>) | undefined): void {
  if (!option || option.disabled) return
  state.setValue(option.value)
  hide()
  buttonRef.value?.focus()
}

function move(step: 1 | -1): void {
  const next = nextEnabledIndex(items.value.length, activeIndex.value + step, step, isDisabled)
  if (next >= 0) activeIndex.value = next
}

function onButtonKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case Key.ArrowDown:
      event.preventDefault()
      if (!open.value) show()
      else move(1)
      break
    case Key.ArrowUp:
      event.preventDefault()
      if (!open.value) show()
      else move(-1)
      break
    case Key.Home:
      event.preventDefault()
      if (!open.value) show()
      activeIndex.value = nextEnabledIndex(items.value.length, 0, 1, isDisabled)
      break
    case Key.End:
      event.preventDefault()
      if (!open.value) show()
      activeIndex.value = nextEnabledIndex(
        items.value.length,
        items.value.length - 1,
        -1,
        isDisabled,
      )
      break
    case Key.Enter:
    case Key.Space:
      event.preventDefault()
      if (open.value) choose(activeOption.value)
      else show()
      break
    case Key.Escape:
      if (!open.value) return
      event.preventDefault()
      hide()
      break
    default:
      typeAhead(event.key)
  }
}

function typeAhead(key: string): void {
  if (!open.value || key.length !== 1 || key.trim() === '') return
  typeBuffer.value += key.toLocaleLowerCase()
  window.clearTimeout(typeTimer)
  typeTimer = window.setTimeout(() => {
    typeBuffer.value = ''
  }, 500)
  const start = activeIndex.value + 1
  for (let offset = 0; offset < items.value.length; offset += 1) {
    const index = (start + offset) % items.value.length
    const option = items.value[index]
    if (!option || option.disabled) continue
    if (option.label.toLocaleLowerCase().startsWith(typeBuffer.value)) {
      activeIndex.value = index
      break
    }
  }
}

function onDocumentPointerDown(event: PointerEvent): void {
  const target = event.target
  if (!(target instanceof Node)) return
  if (rootRef.value?.contains(target) || listRef.value?.contains(target)) return
  hide()
}

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  if (isOpen) document.addEventListener('pointerdown', onDocumentPointerDown)
  else document.removeEventListener('pointerdown', onDocumentPointerDown)
})

watch(activeIndex, () => {
  if (!open.value) return
  const id = activeId.value
  if (!id) return
  document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
})

function observeMore(): void {
  moreObserver?.disconnect()
  const target = moreRef.value
  if (!open.value || !hasMore || !target || typeof IntersectionObserver === 'undefined') return
  moreObserver = new IntersectionObserver((entries) => {
    if (waitingForPage.value || loadingMore || !hasMore) return
    if (!entries.some((entry) => entry.isIntersecting)) return
    waitingForPage.value = true
    emit('load-more')
  })
  moreObserver.observe(target)
}

watch([open, () => hasMore, () => options.length], () => {
  waitingForPage.value = false
  void nextTick(() => observeMore())
})

watch(
  () => loadingMore,
  (loading) => {
    if (loading) return
    waitingForPage.value = false
    void nextTick(() => observeMore())
  },
)

onScopeDispose(() => {
  window.clearTimeout(typeTimer)
  moreObserver?.disconnect()
  if (typeof document === 'undefined') return
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div ref="root" class="ui-select" :data-size="size">
    <button
      :id="field.controlId.value"
      ref="button"
      class="ui-select__button"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="open ? activeId : undefined"
      :aria-invalid="field.isInvalid.value || undefined"
      :aria-describedby="field.describedBy.value"
      :aria-errormessage="field.errorId.value"
      :aria-required="field.isRequired.value || undefined"
      :aria-busy="busy || undefined"
      :disabled="field.isDisabled.value || undefined"
      @click="toggle"
      @keydown="onButtonKeydown"
    >
      <span :class="{ 'ui-select__placeholder': !selected }">
        <slot name="value" :option="selected">{{ selected?.label ?? placeholder }}</slot>
      </span>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M4 6.5 8 10.5 12 6.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="
        state.value.value === undefined || state.value.value === null
          ? ''
          : String(state.value.value)
      "
      :disabled="field.isDisabled.value || undefined"
    />
    <ul
      :id="listId"
      ref="list"
      class="ui-select__list"
      popover="manual"
      role="listbox"
      :aria-labelledby="field.controlId.value"
      tabindex="-1"
    >
      <li
        v-for="(option, index) in items"
        :id="optionId(option.value)"
        :key="option.value === null ? 'all' : String(option.value)"
        :data-all="option.value === null || undefined"
        role="option"
        :aria-selected="state.value.value === option.value"
        :aria-disabled="option.disabled || undefined"
        :data-active="index === activeIndex || undefined"
        @pointerenter="activeIndex = index"
        @click="choose(option)"
      >
        <slot
          name="option"
          :option="option"
          :selected="state.value.value === option.value"
          :active="index === activeIndex"
        >
          <span>{{ option.label }}</span>
          <small v-if="option.hint">{{ option.hint }}</small>
        </slot>
      </li>
      <li v-if="items.length === 0" class="ui-select__more" role="presentation">
        <slot name="empty">No options</slot>
      </li>
      <li v-if="hasMore" ref="more" class="ui-select__more" role="presentation">
        <slot name="footer" :has-more="hasMore" :loading="loadingMore">
          <UiSpinner v-if="loadingMore" label="Loading more options" />
        </slot>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-select {
  position: relative;
  min-width: 0;

  @include control-sizes;
}

.ui-select__button {
  @include control-field;
  @include focus-ring(1px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  text-align: start;
  cursor: pointer;
  transition:
    border-color var(--ui-duration) var(--ui-ease),
    background-color var(--ui-duration) var(--ui-ease),
    color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  svg {
    width: 1rem;
    height: 1rem;
    color: var(--ui-color-muted);
    flex: none;
    transition: transform var(--ui-duration) var(--ui-ease);
  }

  &:active:not(:disabled) {
    transform: scale(var(--ui-press-scale));
  }

  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }

  &:focus {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 1px;
  }
}

.ui-select__placeholder {
  color: var(--ui-color-muted);
}

.ui-select__list {
  z-index: var(--ui-z-dropdown);
  width: max-content;
  max-width: min(24rem, calc(100vw - 1rem));
  max-height: 16rem;
  margin: 0;
  padding: var(--ui-space-1);
  overflow: auto;
  list-style: none;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  box-shadow: var(--ui-shadow-pop);
  opacity: 0;
  transition:
    opacity var(--ui-duration-reveal) var(--ui-ease),
    overlay var(--ui-duration-reveal) allow-discrete,
    display var(--ui-duration-reveal) allow-discrete;

  &:popover-open {
    opacity: 1;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    padding: var(--ui-space-2) var(--ui-space-3);
    border-radius: var(--ui-radius-sm);
    font-size: var(--ui-font-size-sm);
    cursor: pointer;
    transition: background-color var(--ui-duration) var(--ui-ease);
  }

  small {
    color: var(--ui-color-muted);
    font-size: var(--ui-font-size-xs);
  }

  .ui-select__more {
    justify-content: center;
    min-height: 1.75rem;
    color: var(--ui-color-muted);
    cursor: default;
  }

  li[data-active='true'] {
    background: var(--ui-color-accent-subtle);
  }

  li[aria-selected='true'] {
    font-weight: 650;
  }

  li[aria-disabled='true'] {
    color: var(--ui-color-muted);
    cursor: not-allowed;
  }

  li[data-all='true'] {
    margin-bottom: var(--ui-space-1);
    border-bottom: 1px solid var(--ui-color-border);
    border-radius: 0;
  }
}

@starting-style {
  .ui-select__list:popover-open {
    opacity: 0;
  }
}
</style>
