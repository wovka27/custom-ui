import { shallowRef } from 'vue'
import type { UiTone } from '@/types/common'

export interface NoticeInput {
  title?: string
  description: string
  tone?: UiTone
  duration?: number
}

export interface Notice {
  id: number
  title: string
  description: string
  tone: UiTone
  duration: number
}

export function createNoticeStore(fallbackDuration: number) {
  const items = shallowRef<readonly Notice[]>([])
  let nextId = 1

  function push(input: NoticeInput): number {
    const id = nextId
    nextId += 1
    const notice: Notice = {
      id,
      title: input.title ?? '',
      description: input.description,
      tone: input.tone ?? 'neutral',
      duration: input.duration ?? fallbackDuration,
    }
    items.value = [...items.value, notice]
    if (notice.duration > 0) window.setTimeout(() => dismiss(id), notice.duration)
    return id
  }

  function dismiss(id: number): void {
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, push, dismiss }
}
