import { describe, expect, it } from 'vitest'
import { otpValue, writeOtp } from './otp'

describe('writeOtp', () => {
  it('writes one character and a pasted run', () => {
    const first = writeOtp(['', '', '', ''], 0, '1', 4)
    expect(first.chars).toEqual(['1', '', '', ''])
    expect(first.next).toBe(1)
    const pasted = writeOtp(first.chars, 1, '2349', 4)
    expect(pasted.chars).toEqual(['1', '2', '3', '4'])
    expect(pasted.next).toBe(4)
    expect(otpValue(pasted.chars)).toBe('1234')
  })
})
