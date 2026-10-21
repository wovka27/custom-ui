import { createNoticeStore, type NoticeInput } from '@/components/feedback/notice-store'

const store = createNoticeStore(6400)

export const notificationItems = store.items

export function showNotification(input: NoticeInput): number {
  return store.push(input)
}

export function dismissNotification(id: number): void {
  store.dismiss(id)
}
