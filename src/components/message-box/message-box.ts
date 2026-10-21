import { shallowRef } from 'vue'
import type { UiTone } from '@/types/common'

export type MessageBoxKind = 'alert' | 'confirm' | 'prompt'

export interface MessageBoxInput {
  kind?: MessageBoxKind
  title: string
  description?: string
  tone?: UiTone
  confirmLabel?: string
  cancelLabel?: string
  defaultValue?: string
}

interface MessageBoxRequest extends MessageBoxInput {
  id: number
  kind: MessageBoxKind
  description: string
  tone: UiTone
  confirmLabel: string
  cancelLabel: string
  defaultValue: string
  resolve: (value: string | null) => void
}

const queue = shallowRef<readonly MessageBoxRequest[]>([])
let nextId = 1

export const messageBoxQueue = queue

export function openMessageBox(input: MessageBoxInput): Promise<string | null> {
  return new Promise((resolve) => {
    const request: MessageBoxRequest = {
      id: nextId,
      kind: input.kind ?? 'confirm',
      title: input.title,
      description: input.description ?? '',
      tone: input.tone ?? 'neutral',
      confirmLabel: input.confirmLabel ?? 'Confirm',
      cancelLabel: input.cancelLabel ?? 'Cancel',
      defaultValue: input.defaultValue ?? '',
      resolve,
    }
    nextId += 1
    queue.value = [...queue.value, request]
  })
}

export function settleMessageBox(id: number, value: string | null): void {
  const [head, ...rest] = queue.value
  if (!head || head.id !== id) return
  head.resolve(value)
  queue.value = rest
}

export function alertBox(input: Omit<MessageBoxInput, 'kind'>): Promise<void> {
  return openMessageBox({ ...input, kind: 'alert' }).then(() => undefined)
}

export function confirmBox(input: Omit<MessageBoxInput, 'kind'>): Promise<boolean> {
  return openMessageBox({ ...input, kind: 'confirm' }).then((value) => value !== null)
}

export function promptBox(input: Omit<MessageBoxInput, 'kind'>): Promise<string | null> {
  return openMessageBox({ ...input, kind: 'prompt' })
}
