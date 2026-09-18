import { Faker, en, ja } from '@faker-js/faker'
import type { MockContext, MockOptions, MockState } from '/@/mocks/types'

export const DEFAULT_MOCK_SEED = 20260915

export const createEmptyState = (): MockState => ({
  currentUserId: '',
  users: [],
  groups: [],
  rooms: [],
  events: [],
  draftEvents: [],
  availabilities: []
})

export const createMockContext = (options: MockOptions = {}): MockContext => {
  const seed = options.seed ?? DEFAULT_MOCK_SEED
  const now = options.now ?? new Date().toISOString()
  const scenario = options.scenario ?? 'default'
  const delayMs = options.delayMs ?? (scenario === 'slow' ? 1000 : 0)
  if (!Number.isSafeInteger(seed))
    throw new Error('Mock seed must be an integer')
  if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid mock date')
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new Error('Mock delay must be a non-negative number')
  }
  const faker = new Faker({ locale: [ja, en] })
  faker.seed(seed)
  faker.setDefaultRefDate(now)
  return {
    options: { seed, now, scenario, delayMs },
    faker,
    state: createEmptyState()
  }
}

// The datetime-local inputs display the ISO prefix as Japanese local time.
export const mockDate = (context: MockContext, offsetHours = 0): string => {
  const milliseconds =
    Date.parse(context.options.now) + (offsetHours + 9) * 3600000
  return `${new Date(milliseconds).toISOString().slice(0, 23)}+09:00`
}
