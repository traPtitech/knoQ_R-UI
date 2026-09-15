import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest'
import createClient, { type Client } from 'openapi-fetch'
import { setupServer } from 'msw/node'
import type { components, paths } from '/@/lib/api/schema'
import { BASE_URL } from '/@/lib/api/baseUrl'
import { createMockContext } from '/@/mocks/context'
import type { MockContext } from '/@/mocks/types'
import { seedUsers } from '/@/features/user/mocks/factories'
import { createUserHandlers } from '/@/features/user/mocks/handlers'
import { seedGroups } from '/@/features/group/mocks/factories'
import { createGroupHandlers } from '/@/features/group/mocks/handlers'
import { seedRooms } from '/@/features/room/mocks/factories'
import { createRoomHandlers } from '/@/features/room/mocks/handlers'
import { seedEvents } from '/@/features/event/mocks/factories'
import { createEventHandlers } from '/@/features/event/mocks/handlers'

const server = setupServer()
let context: MockContext
let client: Client<paths>

const seedContext = (seed = 20260915): MockContext => {
  const result = createMockContext({ seed, now: '2026-09-15T09:00:00+09:00' })
  seedUsers(result)
  seedGroups(result)
  seedRooms(result)
  seedEvents(result)
  return result
}

const stockRequest = (): components['schemas']['RequestEventStock'] => ({
  name: '日程調整から確定した進捗共有会',
  description: '参加できる日時を選んで開催します．',
  timeStart: '2026-09-16T14:00:00+09:00',
  timeEnd: '2026-09-16T15:30:00+09:00',
  roomId: context.state.rooms[0].roomId,
  groupId: context.state.groups[0].groupId,
  admins: [context.state.currentUserId],
  sharedRoom: true,
  open: true,
  tags: [{ name: 'Vue', locked: true }]
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  context = seedContext()
  server.use(
    ...createUserHandlers(context),
    ...createGroupHandlers(context),
    ...createRoomHandlers(context),
    ...createEventHandlers(context)
  )
  // openapi-fetch captures fetch when the client is created.
  client = createClient<paths>({ baseUrl: BASE_URL })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('related mock APIs over HTTP', () => {
  it('returns a current user, groups and rooms whose references resolve', async () => {
    const [users, me, groups, rooms] = await Promise.all([
      client.GET('/users'),
      client.GET('/users/me'),
      client.GET('/groups'),
      client.GET('/rooms')
    ])
    expect(users.data).toHaveLength(6)
    expect(me.data).toEqual(users.data?.[0])
    expect(groups.data).toHaveLength(2)
    expect(rooms.data).toHaveLength(4)
    const userIds = users.data!.map((user) => user.userId)
    for (const group of groups.data!) {
      expect(group.admins).toContain(me.data!.userId)
      expect(group.members.every((id) => userIds.includes(id))).toBe(true)
      const detail = await client.GET('/groups/{groupID}', {
        params: { path: { groupID: group.groupId } }
      })
      expect(detail.data).toEqual(group)
    }
    expect(
      rooms.data!.every((room) => room.admins.includes(me.data!.userId))
    ).toBe(true)
  })

  it('honors include-suspended and serves user icons locally by ID and name', async () => {
    const user = context.state.users[5]
    user.state = 2
    const active = await client.GET('/users')
    const all = await client.GET('/users', {
      params: { query: { 'include-suspended': true } }
    })
    expect(active.data?.map((entry) => entry.userId)).not.toContain(user.userId)
    expect(all.data?.map((entry) => entry.userId)).toContain(user.userId)
    const icons = await Promise.all(
      [user.userId, user.name].map(async (id) => {
        const response = await fetch(
          `https://q.trap.jp/api/v3/public/icon/${id}`
        )
        expect(response.status).toBe(200)
        expect(response.headers.get('content-type')).toBe('image/svg+xml')
        return response.text()
      })
    )
    expect(icons[0]).toBe(icons[1])
    expect(icons[0]).toContain('<svg')
    expect(decodeURIComponent(user.icon.split(',').slice(1).join(','))).toBe(
      icons[0]
    )
  })

  it('returns summaries that agree with the event detail and sort chronologically', async () => {
    context.state.events.reverse()
    const list = await client.GET('/events')
    expect(list.data).toHaveLength(2)
    expect(Date.parse(list.data![0].timeStart)).toBeLessThan(
      Date.parse(list.data![1].timeStart)
    )
    for (const summary of list.data!) {
      const result = await client.GET('/events/{eventID}', {
        params: { path: { eventID: summary.eventId } }
      })
      expect(result.data).toMatchObject({
        eventId: summary.eventId,
        name: summary.name,
        timeStart: summary.timeStart,
        timeEnd: summary.timeEnd,
        room: { roomId: summary.roomId },
        group: { groupId: summary.groupId }
      })
      expect(summary.attendees).toEqual(
        result
          .data!.attendees.filter(
            (attendee) => attendee.schedule === 'attendance'
          )
          .map((attendee) => attendee.userId)
      )
    }
  })

  it('applies the calendar date range to event and room start times', async () => {
    const query = {
      dateBegin: '2026-09-17T00:00:00+09:00',
      dateEnd: '2026-09-17T23:59:59+09:00'
    }
    const [rooms, events] = await Promise.all([
      client.GET('/rooms', { params: { query } }),
      client.GET('/events', { params: { query } })
    ])
    expect(rooms.data?.map((room) => room.roomId)).toEqual([
      context.state.rooms[1].roomId
    ])
    expect(events.data?.map((event) => event.eventId)).toEqual([
      context.state.events[1].eventId
    ])
    const empty = await client.GET('/events', {
      params: { query: { dateBegin: '2026-10-01T00:00:00Z' } }
    })
    expect(empty.data).toEqual([])
  })

  it('creates an event in an existing room and reflects it in list and detail', async () => {
    const request = stockRequest()
    const roomCount = context.state.rooms.length
    const created = await client.POST('/events', { body: request })
    expect(created.response.status).toBe(201)
    expect(context.state.rooms).toHaveLength(roomCount)
    expect(created.data).toMatchObject({
      name: request.name,
      timeStart: request.timeStart,
      timeEnd: request.timeEnd,
      group: { groupId: request.groupId },
      room: { roomId: request.roomId },
      tags: [{ name: 'Vue', locked: true }]
    })
    const detail = await client.GET('/events/{eventID}', {
      params: { path: { eventID: created.data!.eventId } }
    })
    expect(detail.data).toEqual(created.data)
    const list = await client.GET('/events')
    expect(
      list.data?.find((event) => event.eventId === created.data!.eventId)
    ).toMatchObject({
      name: request.name,
      roomId: request.roomId,
      groupId: request.groupId,
      attendees: []
    })
  })

  it('creates a room for an instant event and resolves that room in later requests', async () => {
    const { roomId: _roomId, ...common } = stockRequest()
    const request: components['schemas']['RequestEventInstant'] = {
      ...common,
      place: 'オンライン通話'
    }
    const before = context.state.rooms.length
    const created = await client.POST('/events', { body: request })
    expect(created.response.status).toBe(201)
    expect(context.state.rooms).toHaveLength(before + 1)
    expect(created.data?.room).toMatchObject({
      place: request.place,
      timeStart: request.timeStart,
      timeEnd: request.timeEnd
    })
    const rooms = await client.GET('/rooms')
    expect(
      rooms.data?.find((room) => room.roomId === created.data!.room.roomId)
    ).toEqual(created.data!.room)
    const list = await client.GET('/events')
    expect(
      list.data?.find((event) => event.eventId === created.data!.eventId)
        ?.roomId
    ).toBe(created.data!.room.roomId)
  })

  it.each([
    ['missing fields', () => ({ name: 'test' })],
    [
      'invalid timestamp',
      () => ({ ...stockRequest(), timeStart: 'not-a-date' })
    ],
    [
      'impossible date',
      () => ({ ...stockRequest(), timeStart: '2026-02-30T12:00:00+09:00' })
    ],
    [
      'end before start',
      () => ({ ...stockRequest(), timeEnd: '2026-09-16T13:00:00+09:00' })
    ],
    ['unknown group', () => ({ ...stockRequest(), groupId: 'missing-group' })],
    ['unknown room', () => ({ ...stockRequest(), roomId: 'missing-room' })],
    ['unknown admin', () => ({ ...stockRequest(), admins: ['missing-user'] })],
    [
      'outside room availability',
      () => ({ ...stockRequest(), timeEnd: '2026-09-16T23:00:00+09:00' })
    ]
  ])('rejects %s without changing stored data', async (_name, body) => {
    const before = structuredClone(context.state)
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body())
    })
    expect(response.status).toBe(400)
    expect(await response.text()).toBe('')
    expect(context.state).toEqual(before)
  })

  it('rejects malformed JSON without mutating stored data', async () => {
    const before = structuredClone(context.state)
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      body: '{'
    })
    expect(response.status).toBe(400)
    expect(context.state).toEqual(before)
  })

  it('reports missing details and icons instead of sending the request to a backend', async () => {
    const [event, group, icon] = await Promise.all([
      client.GET('/events/{eventID}', {
        params: { path: { eventID: 'missing' } }
      }),
      client.GET('/groups/{groupID}', {
        params: { path: { groupID: 'missing' } }
      }),
      fetch('https://q.trap.jp/api/v3/public/icon/missing')
    ])
    expect([event.response.status, group.response.status, icon.status]).toEqual(
      [404, 404, 404]
    )
  })

  it('reads the replaced state on the next request', async () => {
    const oldUserId = context.state.currentUserId
    const replacement = seedContext(42)
    context.state = replacement.state
    const me = await client.GET('/users/me')
    expect(me.data?.userId).toBe(replacement.state.currentUserId)
    expect(me.data?.userId).not.toBe(oldUserId)
    const groups = await client.GET('/groups')
    expect(groups.data).toEqual(replacement.state.groups)
  })
})
