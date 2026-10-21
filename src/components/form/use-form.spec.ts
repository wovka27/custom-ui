import { effectScope, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import type { UiOption } from '@/types/common'
import { block, defineForm, group, optionsKey, query, table, whenKey, type FormModel } from './schema'
import { email, minLength, sameAs } from './rules'
import { serverErrors, useForm, type UseFormReturn } from './use-form'

const roles = [
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
] as const

const schema = defineForm([
  {
    kind: 'text',
    name: 'email',
    label: 'Email',
    required: true,
    rules: [email(), minLength(6)],
  },
  {
    kind: 'text',
    name: 'password',
    label: 'Password',
    required: true,
    rules: [minLength(8)],
  },
  {
    kind: 'text',
    name: 'confirm',
    label: 'Confirm',
    required: true,
    rules: [sameAs('password', 'Passwords do not match.')],
  },
  {
    kind: 'select',
    name: 'role',
    label: 'Role',
    options: roles,
    required: true,
  },
  {
    kind: 'checkbox',
    name: 'agree',
    label: 'Agree',
    required: true,
  },
  group({
    id: 'billing',
    when: (values) => values.role === 'admin',
    fields: [
      {
        kind: 'text',
        name: 'company',
        label: 'Company',
        required: true,
      },
      {
        kind: 'switch',
        name: 'digest',
        label: 'Digest',
        defaultValue: true,
      },
    ],
  }),
])

type Model = FormModel<typeof schema>
type Equal<TLeft, TRight> =
  (<TValue>() => TValue extends TLeft ? 1 : 2) extends <TValue>() => TValue extends TRight ? 1 : 2
    ? true
    : false

const emailIsString: Equal<Model['email'], string> = true
const agreeIsBoolean: Equal<Model['agree'], boolean> = true
const roleIsLiteral: Equal<Model['role'], 'editor' | 'admin' | null> = true
const digestIsBoolean: Equal<Model['digest'], boolean> = true

function mount(
  onSubmit?: (values: Model) => void | Promise<void>,
): UseFormReturn<Model> & { stop: () => void } {
  const scope = effectScope()
  const form = scope.run(() =>
    useForm({
      schema,
      onSubmit,
    }),
  )
  if (!form) throw new Error('Form scope did not start.')
  return { ...form, stop: () => scope.stop() }
}

describe('useForm', () => {
  it('keeps a typed model for text, choice, boolean, and grouped fields', () => {
    expect(emailIsString).toBe(true)
    expect(agreeIsBoolean).toBe(true)
    expect(roleIsLiteral).toBe(true)
    expect(digestIsBoolean).toBe(true)
  })

  it('seeds defaults and skips hidden required fields', async () => {
    const form = mount()
    expect(form.values.value).toMatchObject({
      email: '',
      role: null,
      agree: false,
      digest: true,
    })
    expect(form.values.value.company).toBe('')

    const valid = form.validate()
    expect(valid).toBe(false)
    expect(form.errors.value.company).toBeUndefined()
    expect(form.errors.value.email).toBe('This field is required.')
    expect(form.status.value.status).toBe('invalid')
    form.stop()
  })

  it('submits the visible model and then enforces a revealed conditional field', async () => {
    const submitted: Model[] = []
    const form = mount((values) => {
      submitted.push(values)
    })
    form.setValue('email', 'ada@atelier.dev')
    form.setValue('password', 'correct-horse')
    form.setValue('confirm', 'correct-horse')
    form.setValue('role', 'editor')
    form.setValue('agree', true)

    await form.submit()
    expect(form.status.value.status).toBe('success')
    expect(submitted[0]).toMatchObject({ email: 'ada@atelier.dev', role: 'editor', company: '' })

    form.setValue('role', 'admin')
    await form.submit()
    expect(form.status.value.status).toBe('invalid')
    expect(form.errors.value.company).toBe('This field is required.')
    form.stop()
  })

  it('checks format, length, and cross-field rules', async () => {
    const form = mount()
    form.setValue('email', 'ada')
    form.setValue('password', 'short')
    form.setValue('confirm', 'other')
    form.setValue('role', 'editor')
    form.setValue('agree', true)
    expect(form.validate()).toBe(false)
    expect(form.errors.value.email).toBe('Enter a valid email address.')
    expect(form.errors.value.password).toBe('Use at least 8 characters.')
    expect(form.errors.value.confirm).toBe('Passwords do not match.')
    form.stop()
  })

  it('clears a hidden field error and restores the initial values', async () => {
    const form = mount()
    form.setValue('role', 'admin')
    form.validate()
    expect(form.errors.value.company).toBeTypeOf('string')
    form.setValue('role', 'editor')
    expect(form.errors.value.company).toBeUndefined()

    form.setValue('email', 'ada@atelier.dev')
    form.reset()
    expect(form.values.value.email).toBe('')
    expect(form.status.value.status).toBe('idle')
    expect(form.errors.value).toEqual({})
    form.stop()
  })

  it('records a rejected submit without losing the values', async () => {
    const form = mount(() => {
      throw new Error('Network unavailable.')
    })
    form.setValue('email', 'ada@atelier.dev')
    form.setValue('password', 'correct-horse')
    form.setValue('confirm', 'correct-horse')
    form.setValue('role', 'editor')
    form.setValue('agree', true)
    await form.submit()
    expect(form.status.value).toEqual({ status: 'error', message: 'Network unavailable.' })
    expect(form.values.value.email).toBe('ada@atelier.dev')
    form.stop()
  })
})

function abortError(): Error {
  const error = new Error('Aborted')
  error.name = 'AbortError'
  return error
}

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

describe('useForm queries', () => {
  it('keeps a loaded choice out of the static option union and ignores blocks', () => {
    const schema = defineForm([
      {
        kind: 'select',
        name: 'region',
        label: 'Region',
        options: [{ value: 'eu', label: 'Europe' }] as const,
      },
      {
        kind: 'select',
        name: 'city',
        label: 'City',
        options: query({
          watch: ['region'],
          load: () => [{ value: 'berlin', label: 'Berlin' }],
        }),
      },
      block({ id: 'brief' }),
    ])
    type Model = FormModel<typeof schema>
    type HasBrief = 'brief' extends keyof Model ? true : false
    const regionIsLiteral: Equal<Model['region'], 'eu' | null> = true
    const cityIsOpen: Equal<Model['city'], string | number | null> = true
    const blockIsAbsent: HasBrief = false
    expect(schema.some((node) => node.kind === 'block')).toBe(true)
    expect(regionIsLiteral).toBe(true)
    expect(cityIsOpen).toBe(true)
    expect(blockIsAbsent).toBe(false)
  })

  it('drops an aborted option load and clears a choice the next list does not contain', async () => {
    const resolvers: Array<(options: readonly UiOption<string>[]) => void> = []
    const schema = defineForm([
      {
        kind: 'select',
        name: 'region',
        label: 'Region',
        options: [
          { value: 'eu', label: 'Europe' },
          { value: 'us', label: 'United States' },
        ],
      },
      {
        kind: 'select',
        name: 'city',
        label: 'City',
        options: query({
          watch: ['region'],
          load: ({ signal }) =>
            new Promise((resolve, reject) => {
              signal.addEventListener('abort', () => {
                reject(abortError())
              })
              resolvers.push(resolve)
            }),
        }),
      },
    ])
    const scope = effectScope()
    const form = scope.run(() => useForm({ schema }))
    if (!form) throw new Error('Form scope did not start.')

    expect(form.queries.value[optionsKey('city')]?.status).toBe('pending')
    form.setValue('region', 'eu')
    expect(resolvers).toHaveLength(2)
    resolvers[1]?.([
      { value: 'berlin', label: 'Berlin' },
      { value: 'paris', label: 'Paris' },
    ])
    await flush()
    expect(form.queries.value[optionsKey('city')]).toMatchObject({
      status: 'success',
      data: [
        { value: 'berlin', label: 'Berlin' },
        { value: 'paris', label: 'Paris' },
      ],
    })

    form.setValue('city', 'berlin')
    form.setValue('region', 'us')
    await flush()
    expect(form.values.value.city).toBeNull()
    resolvers[2]?.([{ value: 'austin', label: 'Austin' }])
    await flush()
    expect(form.values.value.city).toBeNull()
    expect(form.queries.value[optionsKey('city')]).toMatchObject({
      status: 'success',
      data: [{ value: 'austin', label: 'Austin' }],
    })
    scope.stop()
  })

  it('waits for a field gate before the revealed field can pass validation', async () => {
    let openGate: (value: boolean) => void = () => {}
    const schema = defineForm([
      {
        kind: 'select',
        name: 'region',
        label: 'Region',
        required: true,
        options: [
          { value: 'eu', label: 'Europe' },
          { value: 'us', label: 'United States' },
        ],
      },
      {
        kind: 'text',
        name: 'vat',
        label: 'VAT',
        required: true,
        when: query({
          watch: ['region'],
          load: ({ values }) => {
            if (values.region !== 'eu') return false
            return new Promise<boolean>((resolve) => {
              openGate = resolve
            })
          },
        }),
      },
    ])
    const scope = effectScope()
    const form = scope.run(() => useForm({ schema }))
    if (!form) throw new Error('Form scope did not start.')
    await flush()
    form.setValue('region', 'eu')
    const pending = form.submit()
    openGate(true)
    await pending
    const vat = schema.find((node) => 'name' in node && node.name === 'vat')
    if (!vat) throw new Error('VAT field is missing.')
    expect(form.queries.value[whenKey(vat)]?.status).toBe('success')
    expect(form.errors.value.vat).toBe('This field is required.')
    expect(form.status.value.status).toBe('invalid')
    scope.stop()
  })
})

describe('useForm table', () => {
  it('keeps selection and edited cells in the model', () => {
    const roster = defineForm([
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
      }),
    ])
    const scope = effectScope()
    const form = scope.run(() => useForm({ schema: () => roster }))
    if (!form) throw new Error('Form scope did not start.')
    expect(roster.some((node) => node.kind === 'table')).toBe(true)
    expect(form.validate()).toBe(false)
    expect(form.errors.value.crew).toBe('Select at least one row.')
    form.setValue('crew', { selected: ['ada'], cells: {} })
    expect(form.validate()).toBe(true)
    const crew = form.values.value.crew
    if (!crew) throw new Error('Crew value is missing.')
    expect(crew.selected).toEqual(['ada'])
    form.setValue('crew', { selected: ['ada'], cells: { ada: { role: ' ' } } })
    expect(form.validate()).toBe(false)
    scope.stop()
  })
})

describe('useForm async errors', () => {
  it('writes a server message onto one field and clears it', () => {
    const form = mount()
    form.setError('email', 'Already registered.')
    expect(form.errors.value.email).toBe('Already registered.')
    expect(form.status.value.status).toBe('invalid')
    form.setError('email', undefined)
    expect(form.errors.value.email).toBeUndefined()
    form.stop()
  })

  it('waits for an async rule and maps a thrown server error', async () => {
    const schema = defineForm([
      {
        kind: 'text',
        name: 'handle',
        label: 'Handle',
        rules: [
          {
            validate: (value) => Promise.resolve(value === 'ada' ? 'Ada is taken.' : undefined),
          },
        ],
      },
    ])
    const scope = effectScope()
    const form = scope.run(() =>
      useForm({
        schema,
        onSubmit: () => {
          throw serverErrors({ handle: 'The desk already has this handle.' })
        },
      }),
    )
    if (!form) throw new Error('Form scope did not start.')
    form.setValue('handle', 'ada')
    await form.submit()
    expect(form.errors.value.handle).toBe('Ada is taken.')
    expect(form.status.value.status).toBe('invalid')

    form.setValue('handle', 'lin')
    await form.submit()
    expect(form.errors.value.handle).toBe('The desk already has this handle.')
    scope.stop()
  })
})
