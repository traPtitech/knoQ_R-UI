import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { createMockServer } from '/@/mocks/node'
import { onUnhandledMockRequest } from '/@/mocks/environment'
import { mockApiUrl } from '/@/mocks/http'

const environment = createMockServer({ seed: 42, now: '2026-09-15T00:00:00Z' })
const { server, context } = environment
beforeAll(() => server.listen({ onUnhandledRequest: onUnhandledMockRequest }))
afterEach(() => {
  server.resetHandlers()
  environment.reset({ scenario: 'default' })
  vi.restoreAllMocks()
})
afterAll(() => server.close())

describe('mock lifecycle', () => {
  it('restores both handler overrides and changed data', async () => {
    const original = structuredClone(context.state.draftEvents)
    context.state.draftEvents.length = 0
    expect(await (await fetch(mockApiUrl('/draft-events'))).json()).toEqual([])
    server.use(
      http.get(
        mockApiUrl('/draft-events'),
        () => new HttpResponse(null, { status: 503 })
      )
    )
    expect((await fetch(mockApiUrl('/draft-events'))).status).toBe(503)
    server.resetHandlers()
    environment.reset()
    const data = await (await fetch(mockApiUrl('/draft-events'))).json()
    expect(data).toHaveLength(original.length)
    expect(data[0].draftEventId).toBe(original[0].draftEventId)
  })

  it('switches empty and error scenarios without replacing the handler definitions', async () => {
    environment.reset({ scenario: 'empty' })
    expect(await (await fetch(mockApiUrl('/draft-events'))).json()).toEqual([])
    environment.reset({ scenario: 'error' })
    expect((await fetch(mockApiUrl('/draft-events'))).status).toBe(500)
    expect((await fetch(mockApiUrl('/users/me'))).status).toBe(200)
    environment.reset({ scenario: 'default' })
    expect((await fetch(mockApiUrl('/draft-events'))).status).toBe(200)
  })

  it('rejects unhandled API requests with a diagnostic', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(fetch(mockApiUrl('/unimplemented'))).rejects.toThrow()
    expect(error).toHaveBeenCalledWith(
      `[MSW] Unhandled mock API: GET ${mockApiUrl('/unimplemented')}`
    )
  })

  it('does not classify application assets as unhandled API requests', () => {
    const error = vi.fn()
    onUnhandledMockRequest(new Request('http://localhost:8080/src/main.ts'), {
      error
    })
    expect(error).not.toHaveBeenCalled()
    onUnhandledMockRequest(new Request(mockApiUrl('/unimplemented')), { error })
    expect(error).toHaveBeenCalledOnce()
  })

  it('uses the requested delay and restores the normal delay on reset', async () => {
    environment.reset({ scenario: 'slow', delayMs: 30 })
    let completed = false
    const response = fetch(mockApiUrl('/users/me')).then((value) => {
      completed = true
      return value
    })
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(completed).toBe(false)
    expect((await response).status).toBe(200)
    environment.reset({ scenario: 'default' })
    expect(context.options.delayMs).toBe(0)
  })
})
