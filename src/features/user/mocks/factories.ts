import type { components } from '/@/lib/api/schema'
import type { MockContext } from '/@/mocks/types'

type User = components['schemas']['ResponseUser']

export const userIconSvg = (userId: string): string => {
  const hue =
    [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="hsl(${hue},55%,88%)"/><circle cx="32" cy="24" r="12" fill="hsl(${hue},45%,38%)"/><path d="M10 64v-8a22 22 0 0 1 44 0v8" fill="hsl(${hue},45%,38%)"/></svg>`
}

export const createMockUser = (
  context: MockContext,
  overrides: Partial<User> = {}
): User => {
  const userId = overrides.userId ?? context.faker.string.uuid()
  return {
    userId,
    name: `dev_${context.faker.string.alphanumeric({ length: 8, casing: 'lower' })}`,
    displayName: context.faker.person.fullName(),
    icon: `data:image/svg+xml,${encodeURIComponent(userIconSvg(userId))}`,
    privileged: false,
    state: 1,
    ...overrides
  }
}

export const seedUsers = (context: MockContext): void => {
  context.state.users = Array.from({ length: 6 }, (_, index) =>
    createMockUser(
      context,
      index === 5
        ? { displayName: '日程調整と進捗共有を担当する開発メンバー' }
        : {}
    )
  )
  context.state.currentUserId = context.state.users[0].userId
}
