import { delay, http, HttpResponse, type RequestHandler } from 'msw'
import { createMockContext } from '/@/mocks/context'
import { mockApiUrl, isMockApiRequest } from '/@/mocks/http'
import type { MockContext, MockOptions } from '/@/mocks/types'
import { seedUsers } from '/@/features/user/mocks/factories'
import { seedGroups } from '/@/features/group/mocks/factories'
import { seedRooms } from '/@/features/room/mocks/factories'
import { seedEvents } from '/@/features/event/mocks/factories'
import { seedDraftEvents } from '/@/features/draft-event/mocks/factories'
import { createUserHandlers } from '/@/features/user/mocks/handlers'
import { createGroupHandlers } from '/@/features/group/mocks/handlers'
import { createRoomHandlers } from '/@/features/room/mocks/handlers'
import { createEventHandlers } from '/@/features/event/mocks/handlers'
import { createDraftHandlers } from '/@/features/draft-event/mocks/handlers'

const seedState = (context: MockContext): void => {
  seedUsers(context)
  seedGroups(context)
  seedRooms(context)
  seedEvents(context)
  seedDraftEvents(context)
  if (context.options.scenario !== 'empty') return
  context.state.events = []
  context.state.draftEvents = []
  context.state.availabilities = []
}

export interface MockEnvironment {
  context: MockContext
  handlers: RequestHandler[]
  reset: (options?: MockOptions) => void
}

export const createMockEnvironment = (
  options: MockOptions = {}
): MockEnvironment => {
  const context = createMockContext(options)
  seedState(context)
  const handlers = [
    http.all(mockApiUrl('/*'), async () => {
      if (context.options.delayMs > 0) await delay(context.options.delayMs)
    }),
    http.get(mockApiUrl('/draft-events'), () => {
      if (context.options.scenario === 'error') {
        return HttpResponse.json(
          { message: '日程調整の取得に失敗しました．' },
          { status: 500 }
        )
      }
    }),
    ...createUserHandlers(context),
    ...createGroupHandlers(context),
    ...createRoomHandlers(context),
    ...createEventHandlers(context),
    ...createDraftHandlers(context),
    // The delay handler already matches all API requests, so MSW's unhandled
    // callback cannot catch these. Terminate unknown endpoints explicitly.
    http.all(mockApiUrl('/*'), ({ request }) => {
      console.error(
        `[MSW] Unhandled mock API: ${request.method} ${request.url}`
      )
      return HttpResponse.error()
    })
  ]
  return {
    context,
    handlers,
    reset: (overrides = {}) => {
      const next = createMockContext({
        ...context.options,
        ...overrides,
        delayMs:
          overrides.delayMs ??
          (overrides.scenario ? undefined : context.options.delayMs)
      })
      seedState(next)
      context.options = next.options
      context.faker = next.faker
      context.state = next.state
    }
  }
}

export const onUnhandledMockRequest = (
  request: Request,
  print: { error: () => void }
): void => {
  if (isMockApiRequest(request)) print.error()
}
