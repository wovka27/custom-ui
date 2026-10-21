import type { UiGap, UiOption, UiSize } from '@/types/common'
import type { UiSelectAllOption } from '@/components/select'
import type { UiInputFormat, UiInputType } from '@/components/input'
import { warn } from '@/lib/warn'

export interface FormTableColumn {
  id: string
  header: string
  align?: 'start' | 'center' | 'end'
  width?: string
  minWidth?: string
  editable?: boolean
  required?: boolean
}

export interface FormTableRow {
  id: string
  cells: Readonly<Record<string, string>>
}

export interface FormTableValue {
  readonly selected: readonly string[]
  readonly cells: Readonly<Record<string, Readonly<Record<string, string>>>>
}

export type FormScalar = string | number | boolean | null

export interface FormSpan {
  start: string | number | null
  end: string | number | null
}

export type FormValue = FormScalar | FormTableValue | FormSpan | readonly string[] | readonly File[]

export type FormValues = Record<string, FormValue>

export type FormPredicate = (values: Readonly<FormValues>) => boolean

export interface FormQueryContext {
  readonly values: Readonly<FormValues>
  readonly signal: AbortSignal
}

export interface FormQuery<T> {
  readonly watch: readonly string[]
  load(context: FormQueryContext): T | Promise<T>
}

export interface FormQueryError {
  readonly message: string
}

export type FormAsyncState<T> =
  | { status: 'idle' }
  | { status: 'pending'; data?: T }
  | { status: 'success'; data: T }
  | { status: 'error'; error: FormQueryError; data?: T }

export type FormQueryMap = Readonly<Record<string, FormAsyncState<unknown>>>

export type FormWhen = FormPredicate | FormQuery<boolean>

export type FormInputMode =
  'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search' | 'none'

export type FormValidateOn = 'submit' | 'blur' | 'input'

export type FormSubmitState =
  | { status: 'idle' }
  | { status: 'invalid' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export type FormRuleResult = string | undefined | Promise<string | undefined>

export interface FormRule<T = FormValue> {
  readonly validate: (value: T, values: Readonly<FormValues>) => FormRuleResult
}

interface FieldBase {
  label: string
  hint?: string
  required?: boolean
  requiredMessage?: string
  disabled?: boolean | FormPredicate
  when?: FormWhen
  span?: 'auto' | 'full'
  size?: UiSize
  chrome?: 'field' | 'bare'
  rules?: readonly FormRule[]
}

export interface FormTextField extends FieldBase {
  kind: 'text'
  name: string
  type?: UiInputType
  format?: UiInputFormat
  locale?: string
  currency?: string
  fractionDigits?: number
  placeholder?: string
  autocomplete?: string
  inputmode?: FormInputMode
  revealable?: boolean
  clearable?: boolean
  readonly?: boolean
  defaultValue?: string
}

export interface FormTextareaField extends FieldBase {
  kind: 'textarea'
  name: string
  placeholder?: string
  rows?: number
  autoSize?: boolean
  readonly?: boolean
  defaultValue?: string
}

export interface FormSelectField<T extends string | number = string | number> extends FieldBase {
  kind: 'select'
  name: string
  options: readonly UiOption<T>[] | FormQuery<readonly UiOption<T>[]>
  allOption?: boolean | UiSelectAllOption<T>
  placeholder?: string
  defaultValue?: T | null
}

export interface FormRadioField<T extends string | number = string | number> extends FieldBase {
  kind: 'radio'
  name: string
  options: readonly UiOption<T>[]
  defaultValue?: T
}

export interface FormCheckboxField extends FieldBase {
  kind: 'checkbox'
  name: string
  defaultValue?: boolean
}

export interface FormSwitchField extends FieldBase {
  kind: 'switch'
  name: string
  defaultValue?: boolean
}

export interface FormTableField extends FieldBase {
  kind: 'table'
  name: string
  caption: string
  columns: readonly FormTableColumn[]
  rows: readonly FormTableRow[] | FormQuery<readonly FormTableRow[]>
  selectable?: boolean
  defaultValue?: FormTableValue
}

export interface FormCustomField extends FieldBase {
  kind: 'custom'
  name: string
  defaultValue: FormValue
}

export interface FormDateField extends FieldBase {
  kind: 'date' | 'datetime'
  name: string
  range?: boolean
  min?: string
  max?: string
  placeholder?: string
  weekStartsOn?: 0 | 1
  locale?: string
  defaultValue?: string | null | FormSpan
}

export interface FormSliderField extends FieldBase {
  kind: 'slider'
  name: string
  min?: number
  max?: number
  step?: number
  range?: boolean
  defaultValue?: number | FormSpan
}

export interface FormColorField extends FieldBase {
  kind: 'color'
  name: string
  variant?: 'panel' | 'inline' | 'swatches'
  swatches?: readonly string[]
  defaultValue?: string
}

export interface FormTagsField extends FieldBase {
  kind: 'tags'
  name: string
  placeholder?: string
  max?: number
  defaultValue?: readonly string[]
}

export interface FormOtpField extends FieldBase {
  kind: 'otp'
  name: string
  length?: number
  type?: 'text' | 'password'
  defaultValue?: string
}

export interface FormSegmentedField<T extends string | number = string | number> extends FieldBase {
  kind: 'segmented'
  name: string
  options: readonly UiOption<T>[]
  defaultValue?: T
}

export interface FormUploadField extends FieldBase {
  kind: 'upload'
  name: string
  accept?: string
  multiple?: boolean
  dropLabel?: string
  defaultValue?: readonly File[]
}

export type FormField =
  | FormTextField
  | FormTextareaField
  | FormSelectField
  | FormRadioField
  | FormCheckboxField
  | FormSwitchField
  | FormTableField
  | FormDateField
  | FormSliderField
  | FormColorField
  | FormTagsField
  | FormOtpField
  | FormSegmentedField
  | FormUploadField
  | FormCustomField

export interface FormBlock {
  kind: 'block'
  id: string
  when?: FormWhen
  source?: FormQuery<unknown>
  span?: 'auto' | 'full'
}

export interface FormGroup {
  kind: 'group'
  id: string
  title?: string
  description?: string
  when?: FormWhen
  source?: FormQuery<unknown>
  columns?: string
  gap?: UiGap
  fields: readonly FormNode[]
}

export type FormNode = FormField | FormGroup | FormBlock

type ValueOf<TNode> = TNode extends { kind: 'text' | 'textarea' | 'color' | 'otp' }
  ? string
  : TNode extends { kind: 'checkbox' | 'switch' }
    ? boolean
    : TNode extends { kind: 'date' | 'datetime'; range: true }
      ? { start: string | null; end: string | null }
      : TNode extends { kind: 'date' | 'datetime' }
        ? string | null
        : TNode extends { kind: 'slider'; range: true }
          ? { start: number; end: number }
          : TNode extends { kind: 'slider' }
            ? number
            : TNode extends { kind: 'tags' }
              ? string[]
              : TNode extends { kind: 'upload' }
                ? readonly File[]
                : TNode extends { kind: 'segmented'; options: readonly (infer Option)[] }
                  ? Option extends { value: infer Value extends string | number }
                    ? Value
                    : string | number
                  : TNode extends { kind: 'select'; options: readonly (infer Option)[] }
      ? Option extends { value: infer Value extends string | number }
        ? Value | null
        : string | number | null
      : TNode extends { kind: 'select' }
        ? string | number | null
        : TNode extends { kind: 'radio'; options: readonly (infer Option)[] }
          ? Option extends { value: infer Value extends string | number }
            ? Value
            : string | number
          : TNode extends { kind: 'table' }
            ? FormTableValue
            : TNode extends { kind: 'custom'; defaultValue: infer Value extends FormValue }
            ? Value
            : FormValue

type Leaf<TNodes, TDepth extends readonly unknown[] = []> = TDepth['length'] extends 6
  ? never
  : TNodes extends readonly [infer THead, ...infer TRest]
    ? | (THead extends { kind: 'group'; fields: infer TFields }
          ? Leaf<TFields, [...TDepth, 0]>
          : THead extends { name: infer TName extends string }
            ? { name: TName; node: THead }
            : never)
      | Leaf<TRest, TDepth>
    : never

type FormModelFrom<TSchema> = {
  [TItem in Leaf<TSchema> as TItem['name']]: ValueOf<TItem['node']>
}

export type FormModel<TSchema extends readonly FormNode[]> = number extends TSchema['length']
  ? FormValues
  : FormModelFrom<TSchema>

export function defineForm<const TSchema extends readonly FormNode[]>(schema: TSchema): TSchema {
  return schema
}

export function group<const TFields extends readonly FormNode[]>(options: {
  id: string
  title?: string
  description?: string
  when?: FormWhen
  source?: FormQuery<unknown>
  columns?: string
  gap?: UiGap
  fields: TFields
}): { kind: 'group'; fields: TFields } & Omit<typeof options, 'fields'> {
  return { kind: 'group', ...options }
}

export function block(options: {
  id: string
  when?: FormWhen
  source?: FormQuery<unknown>
  span?: 'auto' | 'full'
}): FormBlock {
  return { kind: 'block', ...options }
}

export function table(options: {
  name: string
  label: string
  caption: string
  columns: readonly FormTableColumn[]
  rows: readonly FormTableRow[] | FormQuery<readonly FormTableRow[]>
  hint?: string
  required?: boolean
  requiredMessage?: string
  selectable?: boolean
  disabled?: boolean | FormPredicate
  when?: FormWhen
  span?: 'auto' | 'full'
  rules?: readonly FormRule[]
  defaultValue?: FormTableValue
}): FormTableField {
  return {
    kind: 'table',
    ...options,
    selectable: options.selectable ?? true,
    span: options.span ?? 'full',
  }
}

export function emptyTableValue(): FormTableValue {
  return { selected: [], cells: {} }
}

export function isFormSpan(value: unknown): value is FormSpan {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  if (!('start' in value) || !('end' in value) || 'selected' in value) return false
  const start = value.start
  const end = value.end
  const ok = (item: unknown): item is string | number | null =>
    item === null || typeof item === 'string' || typeof item === 'number'
  return ok(start) && ok(end)
}

export function isFormTableValue(value: unknown): value is FormTableValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  if (!('selected' in value) || !('cells' in value)) return false
  const { selected, cells } = value
  if (!Array.isArray(selected) || selected.some((item) => typeof item !== 'string')) return false
  if (typeof cells !== 'object' || cells === null || Array.isArray(cells)) return false
  return Object.values(cells).every(
    (row) => typeof row === 'object' && row !== null && !Array.isArray(row),
  )
}

export function isFormTableRows(value: unknown): value is readonly FormTableRow[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      typeof item.id === 'string' &&
      'cells' in item &&
      typeof item.cells === 'object' &&
      item.cells !== null &&
      !Array.isArray(item.cells),
  )
}

export function sameFormValues(left: FormValues, right: FormValues): boolean {
  const names = new Set([...Object.keys(left), ...Object.keys(right)])
  for (const name of names) {
    if (!sameFormValue(left[name], right[name])) return false
  }
  return true
}

function sameFormValue(left: FormValue | undefined, right: FormValue | undefined): boolean {
  if (Object.is(left, right)) return true
  if (isFormTableValue(left) && isFormTableValue(right)) {
    return JSON.stringify(left) === JSON.stringify(right)
  }
  if (isFormSpan(left) && isFormSpan(right)) return left.start === right.start && left.end === right.end
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => item === right[index])
  }
  return false
}

export function query<T>(source: {
  watch?: readonly string[]
  load: (context: FormQueryContext) => T | Promise<T>
}): FormQuery<T> {
  return { watch: source.watch ?? [], load: source.load }
}

export function isFormQuery(value: unknown): value is FormQuery<unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  if (!('load' in value) || typeof value.load !== 'function') return false
  if (!('watch' in value) || !Array.isArray(value.watch)) return false
  return value.watch.every((item) => typeof item === 'string')
}

export function whenKey(node: FormNode): string {
  if (node.kind === 'group') return `when:group:${node.id}`
  if (node.kind === 'block') return `when:block:${node.id}`
  return `when:${node.name}`
}

export function sourceKey(node: { kind: 'group' | 'block'; id: string }): string {
  return `source:${node.kind}:${node.id}`
}

export function optionsKey(name: string): string {
  return `options:${name}`
}

export function rowsKey(name: string): string {
  return `rows:${name}`
}

export function isOptionList(value: unknown): value is readonly UiOption<string | number>[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'label' in item &&
      typeof item.label === 'string' &&
      'value' in item &&
      (typeof item.value === 'string' || typeof item.value === 'number'),
  )
}

export interface FormQueryBinding {
  key: string
  watch: readonly string[]
  load: FormQuery<unknown>['load']
  optionsFor?: string
}

export function collectQueries(nodes: readonly FormNode[]): FormQueryBinding[] {
  const found: FormQueryBinding[] = []
  const visit = (items: readonly FormNode[]): void => {
    for (const node of items) {
      if (isFormQuery(node.when)) {
        found.push({ key: whenKey(node), watch: node.when.watch, load: node.when.load })
      }
      if (node.kind === 'group') {
        if (node.source) {
          found.push({ key: sourceKey(node), watch: node.source.watch, load: node.source.load })
        }
        visit(node.fields)
        continue
      }
      if (node.kind === 'block') {
        if (node.source) {
          found.push({ key: sourceKey(node), watch: node.source.watch, load: node.source.load })
        }
        continue
      }
      if (node.kind === 'select' && isFormQuery(node.options)) {
        found.push({
          key: optionsKey(node.name),
          watch: node.options.watch,
          load: node.options.load,
          optionsFor: node.name,
        })
      }
      if (node.kind === 'table' && isFormQuery(node.rows)) {
        found.push({ key: rowsKey(node.name), watch: node.rows.watch, load: node.rows.load })
      }
    }
  }
  visit(nodes)
  return found
}

export function collectFields(nodes: readonly FormNode[]): FormField[] {
  const fields: FormField[] = []
  for (const node of nodes) {
    if (node.kind === 'group') fields.push(...collectFields(node.fields))
    else if (node.kind !== 'block') fields.push(node)
  }
  return fields
}

export function isVisible(
  node: FormNode,
  values: Readonly<FormValues>,
  queries: FormQueryMap = {},
): boolean {
  if (!node.when) return true
  if (!isFormQuery(node.when)) return node.when(values)
  const state = queries[whenKey(node)]
  if (!state || state.status === 'idle') return false
  if (state.status === 'success') return state.data === true
  if (typeof state.data === 'boolean') return state.data
  return state.status === 'error'
}

export function isDisabled(
  node: { disabled?: boolean | FormPredicate },
  values: Readonly<FormValues>,
): boolean {
  if (typeof node.disabled === 'function') return node.disabled(values)
  return node.disabled === true
}

export function visibleFields(
  nodes: readonly FormNode[],
  values: Readonly<FormValues>,
  queries: FormQueryMap = {},
): FormField[] {
  const fields: FormField[] = []
  const visit = (items: readonly FormNode[], parentVisible: boolean): void => {
    for (const node of items) {
      const shown = parentVisible && isVisible(node, values, queries)
      if (!shown) continue
      if (node.kind === 'group') visit(node.fields, true)
      else if (node.kind !== 'block') fields.push(node)
    }
  }
  visit(nodes, true)
  return fields
}

export function createDefaults(fields: readonly FormField[]): FormValues {
  const values: FormValues = {}
  const seen = new Set<string>()
  for (const field of fields) {
    if (seen.has(field.name)) warn('UiForm', `Duplicate field name "${field.name}".`)
    seen.add(field.name)
    values[field.name] = fieldDefault(field)
  }
  return values
}

function fieldDefault(field: FormField): FormValue {
  if (field.kind === 'custom') return field.defaultValue
  if (field.kind === 'table') return field.defaultValue ?? emptyTableValue()
  if (field.defaultValue !== undefined) return field.defaultValue
  if (field.kind === 'checkbox' || field.kind === 'switch') return false
  if (field.kind === 'select' || field.kind === 'date' || field.kind === 'datetime') {
    if (field.kind !== 'select' && field.range) return { start: null, end: null }
    return null
  }
  if (field.kind === 'slider') {
    if (field.range) return { start: field.min ?? 0, end: field.max ?? 100 }
    return field.min ?? 0
  }
  if (field.kind === 'tags' || field.kind === 'upload') return []
  if (field.kind === 'color') return '#5aa8ff'
  if (field.kind === 'radio' || field.kind === 'segmented') {
    const first = field.options[0]
    if (!first) throw new Error(`UiForm: ${field.kind} "${field.name}" needs at least one option.`)
    return first.value
  }
  return ''
}
