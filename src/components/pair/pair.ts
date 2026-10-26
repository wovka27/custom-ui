export interface UiPairValue {
  start: number
  end: number
}

export function orderPair(start: number, end: number): UiPairValue {
  return start <= end ? { start, end } : { start: end, end: start }
}

export function swapPair(value: UiPairValue): UiPairValue {
  return { start: value.end, end: value.start }
}
