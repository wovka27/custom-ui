import type { InjectionKey, Ref, Slots } from 'vue'
import type { UiSize } from '@/types/common'
import type { FormAsyncState, FormQueryMap, FormSubmitState, FormValue, FormValues } from './schema'

export interface FieldSlotProps {
  value: FormValue
  error: string | undefined
  disabled: boolean
  setValue: (value: FormValue) => void
}

export interface FormRegionSlotProps {
  values: Readonly<FormValues>
  state: FormAsyncState<unknown>
}

export interface FormApi {
  values: Readonly<Ref<FormValues>>
  errors: Readonly<Ref<Readonly<Partial<Record<string, string>>>>>
  queries: Readonly<Ref<FormQueryMap>>
  status: Readonly<Ref<FormSubmitState>>
  disabled: Readonly<Ref<boolean>>
  size: Readonly<Ref<UiSize | undefined>>
  setValue(name: string, value: FormValue): void
  setError(name: string, message: string | undefined): void
  touch(name: string): void
  submit(): Promise<void>
  reset(): void
}

export const formContextKey: InjectionKey<FormApi> = Symbol('UiForm')
export const formSlotsKey: InjectionKey<Slots> = Symbol('UiFormSlots')
