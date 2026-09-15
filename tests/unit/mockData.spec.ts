import { describe, expect, it } from 'vitest'
import { createMockEnvironment } from '/@/mocks/environment'
import { readMockOptions } from '/@/mocks/options'

const fixed = { seed: 42, now: '2026-09-15T00:00:00Z' }

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

  it.each([fixed, { seed: 2026, now: '2026-10-31T23:45:00+09:00' }])(
    'keeps identifiers and time ranges consistent for %j',
    (options) => {
      const { state } = createMockEnvironment(options).context
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
