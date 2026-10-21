import { createNoticeStore, type NoticeInput } from '@/components/feedback/notice-store'

const store = createNoticeStore(4000)

export const messageItems = store.items

export function showMessage(input: NoticeInput): number {
  return store.push(input)
}

export function dismissMessage(id: number): void {
  store.dismiss(id)
}
