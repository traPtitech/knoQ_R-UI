import type { components } from '/@/lib/api/schema'
import { mockDate } from '/@/mocks/context'
import type { MockContext } from '/@/mocks/types'

type EventDetail = components['schemas']['ResponseEventDetail']
type EventSummary = components['schemas']['ResponseEvent']

export const createMockEvent = (
  context: MockContext,
  overrides: Partial<EventDetail> = {}
): EventDetail => {
  const room = overrides.room ?? context.state.rooms[0]
  const group = overrides.group ?? context.state.groups[0]
  const roomOffsetHours =
    (Date.parse(room.timeStart) - Date.parse(context.options.now)) / 3600000
  return {
    eventId: context.faker.string.uuid(),
    name: `${context.faker.hacker.noun()}の設計を相談する会`,
    description:
      '作っているものを持ち寄り，進捗や困っている点を共有します．\n初めての方も参加できます．',
    sharedRoom: true,
    timeStart: mockDate(context, roomOffsetHours + 1),
    timeEnd: mockDate(context, roomOffsetHours + 2),
    place: room.place,
    groupName: group.name,
    open: true,
    room,
    group,
    admins: [context.state.currentUserId],
    tags: [],
    attendees: group.members.map((userId, index) => ({
      userId,
      schedule: index === 0 ? 'attendance' : index === 1 ? 'absent' : 'pending'
    })),
    createdBy: context.state.currentUserId,
    createdAt: mockDate(context, -24 * 3),
    updatedAt: mockDate(context, -12),
    ...overrides
  }
}

export const toEventSummary = (event: EventDetail): EventSummary => {
  const { room, group, groupName: _groupName, attendees, ...summary } = event
  return {
    ...summary,
    roomId: room.roomId,
    groupId: group.groupId,
    attendees: attendees
      .filter((attendee) => attendee.schedule === 'attendance')
      .map((attendee) => attendee.userId)
  }
}

export const seedEvents = (context: MockContext): void => {
  context.state.events = [
    createMockEvent(context, { name: 'Webアプリの進捗を見せ合う会' }),
    createMockEvent(context, {
      name: 'はじめての開発で困ったことを持ち寄って一緒に考える勉強会',
      room: context.state.rooms[1],
      group: context.state.groups[1]
    })
  ]
}
