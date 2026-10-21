export function warn(component: string, message: string): void {
  if (import.meta.env.DEV) console.warn(`[custom-ui] ${component}: ${message}`)
}
