import type { components } from '/@/lib/api/schema'
import { mockDate } from '/@/mocks/context'
import type { MockContext } from '/@/mocks/types'

type Group = components['schemas']['ResponseGroup']

export const createMockGroup = (
  context: MockContext,
  overrides: Partial<Group> = {}
): Group => ({
  groupId: context.faker.string.uuid(),
  name: `${context.faker.word.noun()}開発チーム`,
  description: '開発の相談や進捗共有のためのグループです．',
  open: true,
  isTraQGroup: false,
  members: context.state.users.map((user) => user.userId),
  admins: [context.state.currentUserId],
  createdBy: context.state.currentUserId,
  createdAt: mockDate(context, -24 * 30),
  updatedAt: mockDate(context, -24),
  ...overrides
})

export const seedGroups = (context: MockContext): void => {
  context.state.groups = [
    createMockGroup(context, { name: 'Webアプリ開発班' }),
    createMockGroup(context, {
      name: '新入生と一緒に学ぶものづくり勉強会',
      members: context.state.users.slice(0, 4).map((user) => user.userId),
      open: false
    })
  ]
}
