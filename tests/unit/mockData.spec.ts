import { describe, expect, it, vi } from 'vitest'
import { createMockEnvironment } from '/@/mocks/environment'
import { readMockOptions } from '/@/mocks/options'
import type { MockContext } from '/@/mocks/types'

const fixed = { seed: 42, now: '2026-09-15T00:00:00Z' }

const expectPastAndFuture = ({ state, options }: MockContext): void => {
  const now = Date.parse(options.now)
  for (const ranges of [
    state.events,
    state.rooms,
    state.draftEvents.flatMap((draft) => draft.candidateSlots)
  ]) {
    expect(ranges.some((range) => Date.parse(range.timeEnd) < now)).toBe(true)
    expect(ranges.some((range) => Date.parse(range.timeStart) > now)).toBe(true)
  }
  expect(
    state.draftEvents.some((draft) => Date.parse(draft.deadline) < now)
  ).toBe(true)
  expect(
    state.draftEvents.some((draft) => Date.parse(draft.deadline) > now)
  ).toBe(true)
}

describe('mock scenarios and data', () => {
  it('recreates initial data and changes the generated data for a different seed', () => {
    const first = createMockEnvironment(fixed)
    const second = createMockEnvironment(fixed)
    expect(first.context.state).toEqual(second.context.state)
    expect(
      createMockEnvironment({ ...fixed, seed: 43 }).context.state
    ).not.toEqual(first.context.state)
    first.context.state.draftEvents.pop()
    first.context.state.availabilities.length = 0
    first.reset()
    expect(first.context.state).toEqual(second.context.state)
  })

  it.each([
    fixed,
    { seed: 2026, now: '2026-10-31T23:59:59+09:00' },
    { seed: 0, now: '2027-01-01T00:00:00+09:00' },
    { seed: 8, now: '2028-03-01T00:00:00-10:00' }
  ])(
    'keeps references, time ranges and past/future coverage consistent for %j',
    (options) => {
      const { context } = createMockEnvironment(options)
      const { state } = context
      expectPastAndFuture(context)
      const userIds = state.users.map((user) => user.userId)
      const groupIds = state.groups.map((group) => group.groupId)
      const roomIds = state.rooms.map((room) => room.roomId)
      const draftIds = state.draftEvents.map((draft) => draft.draftEventId)
      for (const ids of [userIds, groupIds, roomIds, draftIds]) {
        expect(new Set(ids).size).toBe(ids.length)
      }
      expect(userIds).toContain(state.currentUserId)
      const assertUsers = (ids: string[]) =>
        ids.forEach((id) => expect(userIds).toContain(id))
      state.groups.forEach((group) => {
        assertUsers(group.admins)
        assertUsers(group.members)
      })
      state.rooms.forEach((room) => {
        assertUsers(room.admins)
        expect(Date.parse(room.timeStart)).toBeLessThan(
          Date.parse(room.timeEnd)
        )
      })
      state.events.forEach((event) => {
        expect(groupIds).toContain(event.group.groupId)
        expect(roomIds).toContain(event.room.roomId)
        assertUsers(event.admins)
        assertUsers(event.attendees.map((answer) => answer.userId))
        expect(Date.parse(event.timeStart)).toBeLessThan(
          Date.parse(event.timeEnd)
        )
      })
      const slotIds: string[] = []
      state.draftEvents.forEach((draft) => {
        assertUsers(draft.admins)
        assertUsers(draft.invitees)
        draft.candidateSlots.forEach((slot) => {
          slotIds.push(slot.slotId)
          expect(Date.parse(slot.timeStart)).toBeLessThan(
            Date.parse(slot.timeEnd)
          )
        })
      })
      expect(new Set(slotIds).size).toBe(slotIds.length)
      state.availabilities.forEach((answer) => {
        expect(userIds).toContain(answer.userId)
        const draft = state.draftEvents.find(
          (event) => event.draftEventId === answer.draftEventId
        )
        expect(draft).toBeDefined()
        const slots = draft?.candidateSlots.map((slot) => slot.slotId)
        answer.slotIds.forEach((id) => expect(slots).toContain(id))
      })
      expect(
        state.draftEvents.some(
          (event) =>
            event.status === 'open' &&
            Date.parse(event.deadline) > Date.parse(options.now)
        )
      ).toBe(true)
      expect(new Set(state.draftEvents.map((event) => event.status))).toEqual(
        new Set(['open', 'closed', 'confirmed'])
      )
    }
  )

  it('anchors both past and future data to the current time on each page load', () => {
    vi.useFakeTimers()
    try {
      for (const now of ['2026-12-31T23:59:59+09:00', '2035-01-01T00:00:00Z']) {
        vi.setSystemTime(new Date(now))
        const { context } = createMockEnvironment()
        expect(context.options.now).toBe(new Date(now).toISOString())
        expectPastAndFuture(context)
      }
    } finally {
      vi.useRealTimers()
    }
  })

  it.each(['error', 'slow'] as const)(
    'preserves past and future data in %s',
    (scenario) => {
      expectPastAndFuture(createMockEnvironment({ ...fixed, scenario }).context)
    }
  )

  it('keeps the prerequisites for creating an event in the empty scenario', () => {
    const { context } = createMockEnvironment({ ...fixed, scenario: 'empty' })
    expect(context.state.draftEvents).toEqual([])
    expect(context.state.events).toEqual([])
    expect(context.state.availabilities).toEqual([])
    expect(context.state.users.length).toBeGreaterThan(0)
    expect(context.state.groups.length).toBeGreaterThan(0)
    expect(context.state.rooms.length).toBeGreaterThan(0)
  })

  it('rejects misspelled scenarios and invalid reproduction settings', () => {
    expect(() => readMockOptions({ VITE_MOCK_SCENARIO: 'empti' })).toThrow()
    expect(() => readMockOptions({ VITE_MOCK_SEED: 'invalid' })).toThrow()
    expect(() => readMockOptions({ VITE_MOCK_NOW: 'tomorrow' })).toThrow()
    expect(readMockOptions({ VITE_MOCK_SEED: '42' }).seed).toBe(42)
  })
})
