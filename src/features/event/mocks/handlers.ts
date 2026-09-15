import { http, HttpResponse, type RequestHandler } from 'msw'
import { z } from 'zod'
import type { components } from '/@/lib/api/schema'
import {
  createMockEvent,
  toEventSummary
} from '/@/features/event/mocks/factories'
import { createMockRoom } from '/@/features/room/mocks/factories'
import { mockDate } from '/@/mocks/context'
import { mockApiUrl, mockError } from '/@/mocks/http'
import type { MockContext } from '/@/mocks/types'

type EventRequest = components['schemas']['RequestEvent']

const eventFields = {
  name: z.string().trim().min(1),
  description: z.string(),
  sharedRoom: z.boolean(),
  timeStart: z.iso.datetime({ offset: true }),
  timeEnd: z.iso.datetime({ offset: true }),
  groupId: z.string().min(1),
  open: z.boolean().optional(),
  admins: z.array(z.string()),
  tags: z
    .array(
      z.object({ name: z.string().optional(), locked: z.boolean().optional() })
    )
    .optional()
}

const eventRequestSchema = z.union([
  z.object({ ...eventFields, roomId: z.string().min(1) }),
  z.object({ ...eventFields, place: z.string().trim().min(1) })
])

const addEvent = (context: MockContext, body: EventRequest): Response => {
  const { state } = context
  const group = state.groups.find((group) => group.groupId === body.groupId)
  const existingRoom =
    'roomId' in body
      ? state.rooms.find((room) => room.roomId === body.roomId)
      : undefined
  const start = Date.parse(body.timeStart)
  const end = Date.parse(body.timeEnd)
  const invalidReferences =
    !group ||
    body.admins.some(
      (userId) => !state.users.some((user) => user.userId === userId)
    )
  if (invalidReferences || start >= end)
    return new HttpResponse(null, { status: 400 })
  if ('roomId' in body && !existingRoom)
    return new HttpResponse(null, { status: 400 })
  if (
    existingRoom &&
    (start < Date.parse(existingRoom.timeStart) ||
      end > Date.parse(existingRoom.timeEnd))
  ) {
    return new HttpResponse(null, { status: 400 })
  }

  const timestamp = mockDate(context)
  const room =
    existingRoom ??
    createMockRoom(context, {
      place: 'place' in body ? body.place : '',
      timeStart: body.timeStart,
      timeEnd: body.timeEnd,
      admins: [...body.admins],
      createdAt: timestamp,
      updatedAt: timestamp
    })
  const event = createMockEvent(context, {
    name: body.name,
    description: body.description,
    sharedRoom: body.sharedRoom,
    timeStart: body.timeStart,
    timeEnd: body.timeEnd,
    room,
    group,
    open: body.open ?? false,
    admins: [...body.admins],
    tags: (body.tags ?? [])
      .filter((tag) => tag.name)
      .map((tag) => ({
        tagId: context.faker.string.uuid(),
        name: tag.name!,
        locked: tag.locked ?? false
      })),
    attendees: group.members.map((userId) => ({ userId, schedule: 'pending' })),
    createdAt: timestamp,
    updatedAt: timestamp
  })
  if (!existingRoom) state.rooms.push(room)
  state.events.push(event)
  return HttpResponse.json(event, { status: 201 })
}

export const createEventHandlers = (context: MockContext): RequestHandler[] => [
  http.get(mockApiUrl('/events'), ({ request }) => {
    const query = new URL(request.url).searchParams
    const begin = query.get('dateBegin')
    const end = query.get('dateEnd')
    // The approved mock covers date filters used by the calendar, not the search DSL.
    if (query.get('q'))
      return mockError(
        'Event search filters are not supported by this mock',
        400
      )
    return HttpResponse.json(
      context.state.events
        .filter(
          (event) => !begin || Date.parse(event.timeStart) >= Date.parse(begin)
        )
        .filter(
          (event) => !end || Date.parse(event.timeStart) <= Date.parse(end)
        )
        .toSorted(
          (left, right) =>
            Date.parse(left.timeStart) - Date.parse(right.timeStart)
        )
        .map(toEventSummary)
    )
  }),
  http.get(mockApiUrl('/events/:eventID'), ({ params }) => {
    const event = context.state.events.find(
      (event) => event.eventId === params.eventID
    )
    return event
      ? HttpResponse.json(event)
      : mockError('Mock event not found', 404)
  }),
  http.post(mockApiUrl('/events'), async ({ request }) => {
    const body: unknown = await request.json().catch(() => null)
    const parsed = eventRequestSchema.safeParse(body)
    if (!parsed.success) return new HttpResponse(null, { status: 400 })
    return addEvent(context, parsed.data)
  })
]
