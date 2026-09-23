import { describe, expect, it } from 'vitest'
import { createMockContext, mockDate } from '/@/mocks/context'

describe('mock generation context', () => {
  it('repeats Japanese data and dates without sharing the random stream', () => {
    const options = { seed: 42, now: '2026-09-15T00:00:00Z' }
    const first = createMockContext(options)
    const second = createMockContext(options)
    expect(first.faker.person.fullName()).toBe(second.faker.person.fullName())
    expect(first.faker.date.soon()).toEqual(second.faker.date.soon())
    first.state.currentUserId = 'changed'
    expect(second.state.currentUserId).toBe('')
  })

  it('keeps the same instant when formatting dates for Japanese inputs', () => {
    const context = createMockContext({ now: '2026-09-30T16:00:00Z' })
    expect(mockDate(context)).toBe('2026-10-01T01:00:00.000+09:00')
    expect(Date.parse(mockDate(context, 1))).toBe(
      Date.parse('2026-09-30T17:00:00Z')
    )
  })

  it('rejects invalid inputs instead of producing unusable fixtures', () => {
    expect(() => createMockContext({ seed: NaN })).toThrow()
    expect(() => createMockContext({ now: 'invalid' })).toThrow()
    expect(() => createMockContext({ delayMs: -1 })).toThrow()
  })
})
