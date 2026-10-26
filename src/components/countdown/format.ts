export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const clock = [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
  return days > 0 ? `${days}d ${clock}` : clock
}
