# Custom UI

A strict interface kit for Vue 3.5 and TypeScript. A component projects state. Business rules live in a form schema, a composable, or the application. Styles stay inside the component. Appearance is changed with CSS variables on an ancestor.

Requirements: Node.js 22 (see `.nvmrc`) and Vue `^3.5.44`. Vue is a peer dependency. The package is published to npm from `master`.

Public names use the `Ui` prefix. CSS variables and classes use the `ui-` prefix, for example `UiButton` and `--ui-button-radius`.

## Setup

After `npm run build`:

```ts
import { createApp } from 'vue'
import { UiConfigProvider } from 'custom-ui'
import 'custom-ui/styles.css'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue
<template>
  <UiConfigProvider theme="system" locale="en">
    <App />
  </UiConfigProvider>
</template>
```

`UiConfigProvider` sets the `ui-config` class, the theme, and the language. `theme` is `light`, `dark`, or `system`. `system` removes `data-theme` from the document root so the theme follows `prefers-color-scheme`. `useTheme()` stores the choice in `localStorage` under `ui-theme` and applies it to `documentElement`.

The library entry is `src/index.ts`. The build emits the ES module `dist/custom-ui.js`, types at `dist/index.d.ts`, and styles at `dist/custom-ui.css` (`custom-ui/styles.css`). Vue stays external.

## Values

Controls share one rule.

- A missing prop (`undefined`) means the component owns the value and starts from `defaultValue`.
- A passed prop means the parent owns the value, including `null`.

`null` on `UiSelect` is a real “all” choice, not an empty state. A `v-model` on a select with `all-option` therefore has the type `T | null`.

## Appearance

Tokens live in `src/styles/_tokens.scss`. A component reads a public variable and does not declare it again, so an ancestor wins:

```css
.toolbar {
  --ui-button-radius: 2px;
  --ui-color-accent: oklch(0.55 0.14 145);
}
```

A button inside `.toolbar` becomes squarer, and a checked checkbox picks up the new accent. `cssVars` is a short name map for application code. The full contract is `src/styles/token-overrides.json`. Storybook → Utilities → Tokens renders the same tree and has a Copy JSON button. Paste that JSON into a model with the company design. The model fills `proposal` and must not invent token names.

The cascade has two layers:

- Foundation tokens are declared on `:root`. Theme colors and shadows have light and dark values. Type, space, radii, motion, and layout metrics are shared. Changing one moves every consumer.
- Component hooks (`--ui-button-*`, `--ui-control-*`, `--ui-choice-*`, `--ui-switch-*`, `--ui-table-*`) are unset. Each falls back to a foundation token or a literal. Set the hook to restyle one family. One `--ui-button-*` value applies to every variant; the variant differences exist only while the variable is unset.

```text
foundation
  color        page, text, surface, border, accent, status, focus, overlay
  type         sans, display, mono, sizes, line-height
  space        --ui-space-1 … --ui-space-7
  shape        2px / 4px / 6px / pill
  scrollbar    size 8px, radius pill, track transparent, thumb → border-strong, hover → muted
  motion       120ms color, 90ms press, 180ms reveal, scale 0.985
  elevation    shadow-sm and shadow-md are none; shadow-pop lifts dialogs and select menus
  layout       content 76rem, sidebar 15.5rem, container falls back to content, grid min 16rem
button
  shared       --ui-button-radius → 0.75rem
  rest         --ui-button-bg / fg / border
               primary fill transparent, border mixes foreground at 18%
               ghost text is muted, danger text is --ui-color-danger
  hover        --ui-button-bg-hover / fg-hover / border-hover
               primary hover is an accent wash at 14%, not an inverted solid
  fixed        disabled is opacity 0.4; focus ring is --ui-color-focus
field          input, textarea, and the select button share --ui-control-*
  chrome       radius → --ui-radius-md
               bg → surface, fg → fg, border → border
               hover → border-strong, focus → accent, invalid → danger
               disabled bg → subtle, disabled fg → muted
  size         sm 2rem, md 2.5rem, lg 3rem
  fixed        placeholder is --ui-color-muted; invalid label is --ui-color-danger
choice
  checked      --ui-choice-bg-checked and --ui-choice-border-checked → accent
               the radio dot stays --ui-color-accent; the check mark stays --ui-color-accent-fg
  switch       --ui-switch-bg-checked → accent; off track is --ui-color-border-strong
table
  frame        bg → surface, border → border, radius → --ui-radius-lg, max-height → 32rem
  row          hover → surface-raised, selected → accent-subtle
  fixed        embedded tables ignore max-height; zebra uses --ui-color-subtle
dialog         no hooks: surface, border, --ui-radius-lg, --ui-shadow-pop, overlay
pagination     no hooks: 1.75rem squares, 2px radius, current page uses fg on bg
```

Motion is short: color and border in 120ms, press in 90ms at a scale of `0.985`, reveal in 180ms. Under `prefers-reduced-motion: reduce`, durations collapse and `--ui-press-scale` becomes `1`. Text fields do not scale, so the caret does not jump.

Pagination stays square at 28px. Its radius does not follow `--ui-button-radius`.

Scrollbars share one treatment: the page bar and every `overflow` region inside `.ui-config`. Set `--ui-scrollbar-size`, `--ui-scrollbar-radius`, `--ui-scrollbar-track`, `--ui-scrollbar-thumb`, or `--ui-scrollbar-thumb-hover` on an ancestor. Size and radius are declared. The track is transparent until set. The thumb falls back to `--ui-color-border-strong`, and hover falls back to `--ui-color-muted`. Firefox uses the `thin` keyword for thickness. The carousel track keeps its scrollbar hidden because the pager is the control.

## Components

### Button

`UiButton` is a soft control with a `0.75rem` radius. At rest the background is transparent and the border is a hairline. Hover uses an accent wash, not an inverted fill.

`variant`: `primary`, `secondary`, `ghost`, `danger`. `size`: `sm`, `md`, `lg`. `loading` blocks a second press and marks the control busy. `href` renders a link. `iconOnly` needs an accessible name.

### Field

`UiField` connects the label, hint, and error to the control. The hint and error reveal by animating height. A required label turns danger-colored when the field is invalid. `UiVisuallyHidden` keeps text in the accessibility tree while removing it from the screen.

### Input

`UiInput` and `UiTextarea`. An input has `type`, `format`, `clearable`, and `revealable` for passwords. `format` masks the display and stores a canonical string:

`phone`, `currency`, `percent`, `integer`, `decimal`, `date`, `time`, `credit-card`, `iban`, `postal`.

Date and currency follow `locale`, `currency`, and `fractionDigits`. In `en`, typing `12312026` becomes `12/31/2026`.

### Choice

`UiCheckbox` takes a boolean and supports an indeterminate state. `UiSwitch` uses the same contract for on and off. `UiRadioGroup` takes `options` of `{ value, label, hint?, disabled? }`.

`UiSelect` opens a listbox from a button. `all-option` prepends a choice. `true` uses the label All and the value `null`. An object `{ label, value }` supplies its own label and value. A custom value that already exists in the list is not duplicated.

```vue
<UiSelect v-model="status" :options="statuses" all-option name="status" />
```

Here `status` has the type `Status | null`. `null` means every status.

### Feedback

`UiBadge` is colored with `tone`: `neutral`, `accent`, `success`, `warning`, `danger`, `info`. `UiAlert` shows a title and description. `dismissible` adds a close button. `UiSpinner` announces `label` unless it is decorative. `UiTabs` takes `tabs` and renders each panel in a slot named after the tab `id`.

### Dialog

`UiDialog` is a native `<dialog>` teleported to the document body. Open it with `v-model:open`. `persistent` blocks the backdrop, Escape, and the close button. Setting `open` to `false` still closes it. `size`: `sm`, `md`, `lg`. The `footer` slot receives `close` and `closing`.

`beforeClose` runs after a close is requested and before `dialog.close()`:

```ts
async function beforeClose(): Promise<boolean> {
  await save()
  return true
}
```

`false` and a thrown error keep the dialog open and restore `v-model` to `true`. While the promise is pending, the dialog has `aria-busy`, the close button is disabled, and `closing` in the footer is `true`.

Several open dialogs close from the top down. A lower dialog waits until the upper one finishes `beforeClose` and actually closes, then starts its own wait. Escape and a backdrop click target the top dialog. Setting `open` to `false` on several dialogs in one turn joins the same queue.

### Data

`UiBreadcrumb` takes `items` with `id`, `label`, and an optional `href`. `UiPagination` is controlled with `v-model:page` and `pageCount`. The number window uses arrows and an ellipsis, with no comma. The current page is filled.

`UiTable` is generic over the row. A column sets `id`, `header`, `cell`, and optionally `sortable`, `sortValue`, `align`, `width`, and `minWidth`. A row is identified by `rowKey`. The table supports selection, zebra rows, sorting, `loading`, density, and an `empty` slot.

`layout="fixed"` fixes column widths. `embedded` removes the max height and does not clip vertically, so a field or popover inside a cell stays visible. Slots `toolbar`, `footer`, `header-${id}`, and `cell-${id}` replace the toolbar, footer, header, and cell. A cell can hold `UiForm` with `as="region"`: that is a group, not a nested `<form>`, so layout and submit stay intact.

`sortRows` sorts an array outside the table when a page paginates data it has already sorted.

### Layout

`UiAppShell` is the header, sidebar, and content. `v-model:nav-open` controls the mobile menu. `UiContainer` limits width. `UiStack` stacks blocks vertically, `UiCluster` wraps them in a row, and `UiGrid` builds columns from `min-column`. `gap` on all three uses the `xs`–`xl` scale. `UiSeparator` divides sections.

## Form generator

`UiForm` renders a schema. `defineForm` keeps literal field types. `useForm` exposes the same values without markup.

```ts
const profile = defineForm([
  {
    kind: 'text',
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    rules: [email()],
  },
])
```

```vue
<UiForm :schema="profile" label="Profile" submit-label="Save" @submit="onSubmit" />
```

Field kinds: `text`, `textarea`, `select`, `radio`, `checkbox`, `switch`, `date`, `datetime`, `slider`, `color`, `tags`, `otp`, `segmented`, `upload`, `table`, `custom`. `date`, `datetime`, and `slider` accept `range`. Each field can set `label`, `hint`, `required`, `rules`, `when`, `disabled`, `span` (`auto` or `full`), and `size`.

`group` builds a section with a title, description, and its own columns. `block` is a region that is not a field: the `#block-${id}` slot receives `values` and `state`. `#section-${id}` renders a group header. `#field-${name}` replaces a control. The `header`, `actions`, and `footer` slots replace the chrome. `chrome: 'bare'` removes the field shell where it is not wanted.

Rules: `required`, `email`, `minLength`, `maxLength`, `pattern`, `sameAs`. A rule may return a string or a promise of a string. `validate()` stays synchronous and skips promises. `submit`, and `blur` or `input` after a field is revealed, wait for those promises. A field hidden by `when` is not validated. After an invalid submit, focus moves to the first invalid field. `validateOn` is `submit`, `blur`, or `input`.

`setError(name, message)` and `setErrors({ name: message })` place a message on a field when the check lives only on the server. `serverErrors({ email: 'Taken.' })` thrown from `onSubmit` does the same. Pass `undefined` to clear one field.

Loading is a discriminated union, not a pair of flags: `idle`, `pending`, `success`, `error`. Form queries and submit status both use that shape.

### Queries

`query({ watch, load })` reruns when the named fields change. `load` receives `values` and an `AbortSignal`. Use it to:

- replace a select’s `options`;
- show or hide a field through `when`;
- fill the `source` of a group or block.

While a query runs, the slot sees `state.status === 'pending'`. An abort (`AbortError`) is not a user-facing error.

### Table inside a form

`table()` is a field in the model, not a separate widget.

```ts
table({
  name: 'crew',
  label: 'Crew',
  caption: 'People on this desk',
  required: true,
  columns: [
    { id: 'name', header: 'Name' },
    { id: 'role', header: 'Role', editable: true, required: true },
  ],
  rows: [{ id: 'ada', cells: { name: 'Ada', role: 'Editor' } }],
})
```

The field value is:

```ts
{
  selected: ['ada'],
  cells: { ada: { role: 'Lead' } }
}
```

`required` on the table demands at least one selected row unless selection is disabled with `selectable: false`. `required` on a column checks the text of selected rows: the edit in `cells` first, then the original cell text. Rows may be an array or a `query`.

### Form inside a form

A nested `<form>` is invalid HTML. `as="region"` renders `role="group"`, and the submit button has `type="button"` while calling the same `submit`. That is how a form lives in a table cell or inside another dialog without breaking the outer form.

The `#field-${name}` slot for `custom` receives `value`, `error`, `disabled`, and `setValue`. If the slot is a functional component, it must declare `props`. Otherwise Vue treats `setValue` as a plain attribute.

## More components

`UiSelect` options can be rendered with the `option` and `value` slots. `has-more` and `loading-more` ask the list to emit `load-more` when the end is visible, so a paged backend can append the next slice.

`UiSwitch` paints its state from `data-state`, so the thumb and track move even when the browser keeps `aria-checked` as a property.

`UiDatePicker` is one date, or a `range` with a start and an end. The first pick sets the start. The second pick sets the end and orders them. Trigger, header, day, and footer are slots. `min` and `max` are ISO dates. `--ui-date-day-selected-bg` and `--ui-date-day-selected-fg` recolor the selected day. `UiDateTimePicker` adds a time to that same single or range value. A single value is `YYYY-MM-DDTHH:mm`. A range is `{ start, end }`.

`UiSlider` is one value, or a `range` with two thumbs. Changing `min` or `max` clamps both ends. `--ui-slider-track`, `--ui-slider-fill`, and `--ui-slider-thumb` restyle it. `UiColorPicker` edits a hex color. `variant` is `panel` (the popover), `inline` (always open), or `swatches` (chips and a hex field). `UiInputTag` commits on Enter or a separator. `UiInputOtp` is a fixed row of cells and accepts a paste. `UiSegmented` is a single-choice radio group. `UiUpload` keeps the selected files inside the control and can run a `request` that reports progress and accepts an abort signal.

`UiTable` can group a header across several cells with `children` on a column. A single column spans both header rows, and a group title is centered over its cells. The `header` slot replaces the header rows. The `empty` slot replaces the state shown when there are no rows. The `detail` slot adds a disclosure under a row, controlled with `expanded`. The `actions` slot is a sticky column on the inline end, and `actions-header` names it. `UiDataTable` renders that table from a `defineTable` schema: columns, groups, sort, selection, page size, and empty copy. A column `field` is the sort value, and `value` is the displayed text. Cell, header, detail, actions, and empty stay slots. `UiPagination` takes `page-sizes` and `v-model:page-size`. The page buttons stay 28px squares with a 2px radius. The row count is a select of the same height. `UiEmpty` is `plain`, `panel`, or `dashed`, with `media` and `actions` slots. `UiTimeline` lists events. `UiAnchor` links to element ids and marks the section in view.

`UiMessage` keeps the title and description in one column and the dismiss control in the other. `UiPopover` and `UiTooltip` anchor to the trigger. `placement` is `top`, `bottom`, `start`, or `end`. `align` is `start`, `center`, or `end` along that edge. Both use CSS anchor positioning, with a measured fallback. `UiMessage`, `UiNotification`, and `UiMessageBox` each need their host mounted once: `showMessage`, `showNotification`, `confirmBox`, `alertBox`, and `promptBox`. Notifications enter from the right edge and stack downward. `UiTour` walks `selector` steps. `UiProgress` is a `line`, `bar`, `circle`, or `steps` meter. `UiCarousel` snaps slides. `controls` is `inside`, `top`, `bottom`, or `none`. `pagination` is `dots` or `line`, always along the bottom of the frame, and `pagination-trigger` is `click` or `hover`. `UiCollapse` opens one item, or several when `multiple` is set. `UiDivider` is a rule with an optional label. `UiImage` covers loading, error, ratio, and an optional preview.

## Accessibility


Controls expose a visible focus, a name, and a role. The dialog uses the native focus trap. A field error is associated with its control. Icons without text are hidden from the accessibility tree. Motion follows `prefers-reduced-motion`. Storybook checks screens with the a11y addon.
