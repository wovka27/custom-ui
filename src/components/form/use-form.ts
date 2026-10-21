import { computed, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { useFormQueries } from './queries'
import { required } from './rules'
import {
  collectFields,
  createDefaults,
  isFormQuery,
  isFormTableRows,
  isFormTableValue,
  rowsKey,
  sameFormValues,
  visibleFields,
  type FormField,
  type FormModel,
  type FormNode,
  type FormQueryMap,
  type FormRuleResult,
  type FormSubmitState,
  type FormTableField,
  type FormTableRow,
  type FormTableValue,
  type FormValidateOn,
  type FormValue,
  type FormValues,
} from './schema'

export interface UseFormOptions<TSchema extends readonly FormNode[]> {
  schema: MaybeRefOrGetter<TSchema>
  initial?: MaybeRefOrGetter<Partial<FormModel<TSchema>> | undefined>
  modelValue?: MaybeRefOrGetter<FormModel<TSchema> | undefined>
  validateOn?: MaybeRefOrGetter<FormValidateOn | undefined>
  onSubmit?: (values: FormModel<TSchema>) => void | Promise<void>
  onInvalid?: (errors: Readonly<Partial<Record<string, string>>>) => void
}

export interface UseFormReturn<TValues extends FormValues> {
  values: Readonly<Ref<TValues>>
  errors: Readonly<Ref<Readonly<Partial<Record<string, string>>>>>
  queries: Readonly<Ref<FormQueryMap>>
  status: Readonly<Ref<FormSubmitState>>
  setValue(name: keyof TValues & string, value: FormValue): void
  setError(name: string, message: string | undefined): void
  setErrors(messages: Partial<Record<string, string>>): void
  touch(name: string): void
  submit(): Promise<void>
  reset(): void
  validate(): boolean
  validateAsync(): Promise<boolean>
}

export interface FormServerError extends Error {
  readonly fields: Readonly<Partial<Record<string, string>>>
}

export function serverErrors(fields: Partial<Record<string, string>>): FormServerError {
  return Object.assign(new Error('The server rejected these fields.'), { fields })
}

function isServerError(error: unknown): error is FormServerError {
  if (!(error instanceof Error) || !('fields' in error)) return false
  const fields = error.fields
  if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) return false
  return Object.values(fields).every((item) => item === undefined || typeof item === 'string')
}

function textMessage(result: FormRuleResult): string | undefined {
  return typeof result === 'string' && result.length > 0 ? result : undefined
}

function sameValues(left: FormValues, right: FormValues): boolean {
  return sameFormValues(left, right)
}

function ruleResults(field: FormField, current: FormValues, queries: FormQueryMap): FormRuleResult[] {
  const value = current[field.name] ?? null
  if (field.kind === 'table') return tableResults(field, value, current, queries)
  const results: FormRuleResult[] = []
  if (field.required) results.push(required(field.requiredMessage).validate(value, current))
  for (const rule of field.rules ?? []) results.push(rule.validate(value, current))
  return results
}

function messageFor(field: FormField, current: FormValues, queries: FormQueryMap): string | undefined {
  for (const result of ruleResults(field, current, queries)) {
    const message = textMessage(result)
    if (message) return message
  }
  return undefined
}

async function messageForAsync(
  field: FormField,
  current: FormValues,
  queries: FormQueryMap,
): Promise<string | undefined> {
  for (const result of ruleResults(field, current, queries)) {
    const message = textMessage(await result)
    if (message) return message
  }
  return undefined
}

function tableResults(
  field: FormTableField,
  value: FormValue,
  current: FormValues,
  queries: FormQueryMap,
): FormRuleResult[] {
  const table = isFormTableValue(value) ? value : { selected: [], cells: {} }
  if (field.selectable !== false && field.required && table.selected.length === 0) {
    return [field.requiredMessage ?? 'Select at least one row.']
  }
  const rows = tableRows(field, queries)
  const ids = field.selectable === false ? rows.map((row) => row.id) : table.selected
  const missing = field.columns.some((column) => {
    if (!column.required) return false
    return ids.some((id) => cellText(table, rows, id, column.id).trim() === '')
  })
  if (missing) return [field.requiredMessage ?? 'Fill in the selected rows.']
  return (field.rules ?? []).map((rule) => rule.validate(table, current))
}

function tableRows(field: FormTableField, queries: FormQueryMap): readonly FormTableRow[] {
  if (!isFormQuery(field.rows)) return field.rows
  const state = queries[rowsKey(field.name)]
  const data = !state || state.status === 'idle' ? undefined : state.data
  return isFormTableRows(data) ? data : []
}

function cellText(
  table: FormTableValue,
  rows: readonly FormTableRow[],
  rowId: string,
  columnId: string,
): string {
  const edited = table.cells[rowId]?.[columnId]
  if (edited !== undefined) return edited
  return rows.find((row) => row.id === rowId)?.cells[columnId] ?? ''
}

export function useForm<const TSchema extends readonly FormNode[]>(
  options: UseFormOptions<TSchema>,
): UseFormReturn<FormModel<TSchema>> {
  const schema = (): TSchema => toValue(options.schema)

  function withDefaults(extra?: Partial<FormValues>): FormValues {
    const defaults = createDefaults(collectFields(schema()))
    const next: FormValues = {}
    for (const [name, fallback] of Object.entries(defaults)) {
      const override = extra?.[name]
      next[name] = override === undefined ? fallback : override
    }
    return next
  }

  const values = shallowRef<FormValues>(
    withDefaults({ ...toValue(options.initial), ...toValue(options.modelValue) }),
  )
  const errors = shallowRef<Readonly<Partial<Record<string, string>>>>({})
  const revealed = shallowRef<ReadonlySet<string>>(new Set())
  const status = shallowRef<FormSubmitState>({ status: 'idle' })
  let wave = 0
  const runtime = useFormQueries(schema, values, (name) => {
    if (values.value[name] == null) return
    values.value = { ...values.value, [name]: null }
  })

  function mode(): FormValidateOn {
    return toValue(options.validateOn) ?? 'submit'
  }

  function writeErrors(next: Partial<Record<string, string>>): void {
    errors.value = next
    if (status.value.status === 'invalid' && Object.keys(next).length === 0) {
      status.value = { status: 'idle' }
    }
  }

  function keepErrors(
    source: Readonly<Partial<Record<string, string>>>,
    include: (name: string) => boolean,
  ): Partial<Record<string, string>> {
    const next: Partial<Record<string, string>> = {}
    for (const [name, message] of Object.entries(source)) {
      if (message && include(name)) next[name] = message
    }
    return next
  }

  function pruneHidden(): void {
    const visible = new Set(
      visibleFields(schema(), values.value, runtime.queries.value).map((field) => field.name),
    )
    const next = keepErrors(errors.value, (name) => visible.has(name))
    if (Object.keys(next).length !== Object.keys(errors.value).length) writeErrors(next)
  }

  function publish(next: Partial<Record<string, string>>, invalid: boolean): boolean {
    writeErrors(next)
    const valid = Object.keys(next).length === 0
    if (!valid && invalid) status.value = { status: 'invalid' }
    else if (valid && status.value.status === 'invalid') status.value = { status: 'idle' }
    return valid
  }

  async function revalidate(name: string): Promise<void> {
    const ticket = ++wave
    const field = collectFields(schema()).find((item) => item.name === name)
    const shown = visibleFields(schema(), values.value, runtime.queries.value).some(
      (item) => item.name === name,
    )
    const message =
      field && shown ? await messageForAsync(field, values.value, runtime.queries.value) : undefined
    if (ticket !== wave) return
    const next = keepErrors(errors.value, (key) => key !== name)
    if (message) next[name] = message
    writeErrors(next)
  }

  function setErrors(messages: Partial<Record<string, string>>): void {
    wave += 1
    const next: Partial<Record<string, string>> = {}
    for (const [name, message] of Object.entries(errors.value)) {
      if (!message) continue
      const incoming = messages[name]
      if (name in messages && (incoming === undefined || incoming === '')) continue
      next[name] = message
    }
    const shown = new Set(revealed.value)
    for (const [name, message] of Object.entries(messages)) {
      if (typeof message !== 'string' || message.length === 0) continue
      next[name] = message
      shown.add(name)
    }
    revealed.value = shown
    publish(next, true)
  }

  function setError(name: string, message: string | undefined): void {
    setErrors({ [name]: message })
  }

  function setValue(name: string, value: FormValue): void {
    if (values.value[name] === value) return
    values.value = { ...values.value, [name]: value }
    pruneHidden()
    if (revealed.value.has(name) && mode() !== 'submit') void revalidate(name)
  }

  function touch(name: string): void {
    if (mode() === 'submit') return
    if (!revealed.value.has(name)) revealed.value = new Set(revealed.value).add(name)
    void revalidate(name)
  }

  function validate(): boolean {
    wave += 1
    const shown = visibleFields(schema(), values.value, runtime.queries.value)
    revealed.value = new Set(shown.map((field) => field.name))
    const next: Partial<Record<string, string>> = {}
    for (const field of shown) {
      const message = messageFor(field, values.value, runtime.queries.value)
      if (message) next[field.name] = message
    }
    return publish(next, true)
  }

  async function validateAsync(): Promise<boolean> {
    const ticket = ++wave
    const shown = visibleFields(schema(), values.value, runtime.queries.value)
    revealed.value = new Set(shown.map((field) => field.name))
    const next: Partial<Record<string, string>> = {}
    for (const field of shown) {
      const message = await messageForAsync(field, values.value, runtime.queries.value)
      if (message) next[field.name] = message
    }
    if (ticket !== wave) return Object.keys(errors.value).length === 0
    return publish(next, true)
  }

  async function submit(): Promise<void> {
    await runtime.settle()
    if (!(await validateAsync())) {
      options.onInvalid?.(errors.value)
      return
    }
    status.value = { status: 'submitting' }
    try {
      await options.onSubmit?.(withDefaults(values.value) as FormModel<TSchema>)
      if (status.value.status === 'submitting') status.value = { status: 'success' }
    } catch (error) {
      if (isServerError(error)) {
        setErrors({ ...error.fields })
        options.onInvalid?.(errors.value)
        return
      }
      const message =
        error instanceof Error && error.message.length > 0
          ? error.message
          : 'Could not submit the form.'
      status.value = { status: 'error', message }
    }
  }

  function reset(): void {
    values.value = withDefaults(toValue(options.initial))
    revealed.value = new Set()
    errors.value = {}
    status.value = { status: 'idle' }
    runtime.restart()
  }

  watch(
    () => toValue(options.modelValue),
    (next) => {
      if (!next) return
      const merged = withDefaults(next)
      if (!sameValues(merged, values.value)) values.value = merged
    },
  )

  watch(
    () =>
      collectFields(schema())
        .map((field) => field.name)
        .join('\0'),
    () => {
      const merged = withDefaults(values.value)
      if (!sameValues(merged, values.value)) values.value = merged
      pruneHidden()
    },
  )

  watch(runtime.queries, () => {
    pruneHidden()
  })

  return {
    values: computed(() => withDefaults(values.value) as FormModel<TSchema>),
    errors,
    queries: runtime.queries,
    status,
    setValue,
    setError,
    setErrors,
    touch,
    submit,
    reset,
    validate,
    validateAsync,
  }
}
