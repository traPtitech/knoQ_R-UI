import type { Faker } from '@faker-js/faker'
import type { components } from '/@/lib/api/schema'
import type {
  ResponseAvailability,
  ResponseDraftEventDetail
} from '/@/features/draft-event/types'

export type MockScenario = 'default' | 'empty' | 'error' | 'slow'

export interface MockOptions {
  seed?: number
  now?: string
  scenario?: MockScenario
  delayMs?: number
}

export interface MockState {
  currentUserId: string
  users: components['schemas']['ResponseUser'][]
  groups: components['schemas']['ResponseGroup'][]
  rooms: components['schemas']['ResponseRoom'][]
  events: components['schemas']['ResponseEventDetail'][]
  draftEvents: ResponseDraftEventDetail[]
  availabilities: ResponseAvailability[]
}

export interface MockContext {
  options: Required<MockOptions>
  faker: Faker
  state: MockState
}
