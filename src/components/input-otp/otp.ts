export function writeOtp(
  chars: readonly string[],
  index: number,
  raw: string,
  length: number,
): { chars: string[]; next: number } {
  const nextChars = chars.slice(0, length)
  while (nextChars.length < length) nextChars.push('')
  const incoming = [...raw].filter((char) => char.trim() !== '').slice(0, length - index)
  for (let offset = 0; offset < incoming.length; offset += 1) {
    nextChars[index + offset] = incoming[offset] ?? ''
  }
  return { chars: nextChars, next: Math.min(length, index + incoming.length) }
}

export function otpValue(chars: readonly string[]): string {
  return chars.join('')
}
