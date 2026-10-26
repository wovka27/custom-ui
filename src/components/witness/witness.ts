export interface WitnessMark {
  readonly name: string
  readonly at: string
}

export function witnessWhen(at: string): string {
  const date = new Date(at)
  if (Number.isNaN(date.getTime())) return at
  return date.toISOString().slice(0, 16).replace('T', ' ')
}
