import { setupServer } from 'msw/node'
import {
  createMockEnvironment,
  type MockEnvironment
} from '/@/mocks/environment'
import type { MockOptions } from '/@/mocks/types'

export interface MockServer extends MockEnvironment {
  server: ReturnType<typeof setupServer>
}

export const createMockServer = (options: MockOptions = {}): MockServer => {
  const environment = createMockEnvironment(options)
  return { ...environment, server: setupServer(...environment.handlers) }
}
