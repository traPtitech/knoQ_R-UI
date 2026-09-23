import type { components } from '/@/lib/api/schema'
import { mockDate } from '/@/mocks/context'
import type { MockContext } from '/@/mocks/types'

type Room = components['schemas']['ResponseRoom']

export const createMockRoom = (
  context: MockContext,
  overrides: Partial<Room> = {}
): Room => ({
  roomId: context.faker.string.uuid(),
  place: `S${context.faker.number.int({ min: 201, max: 516 })}`,
  timeStart: `${mockDate(context, 24).slice(0, 10)}T10:00:00+09:00`,
  timeEnd: `${mockDate(context, 24).slice(0, 10)}T20:00:00+09:00`,
  verified: true,
  admins: [context.state.currentUserId],
  createdBy: context.state.currentUserId,
  createdAt: mockDate(context, -24 * 7),
  updatedAt: mockDate(context, -24),
  ...overrides
})

export const seedRooms = (context: MockContext): void => {
  context.state.rooms = [1, 2, 3, -2].map((dayOffset) => {
    const date = mockDate(context, 24 * dayOffset).slice(0, 10)
    return createMockRoom(context, {
      timeStart: `${date}T10:00:00+09:00`,
      timeEnd: `${date}T20:00:00+09:00`
    })
  })
}
