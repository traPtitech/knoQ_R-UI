// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const calls = vi.hoisted(() => ({ startMocking: vi.fn(), mountApp: vi.fn() }))
vi.mock('/@/mocks/browser', () => ({ startMocking: calls.startMocking }))
vi.mock('/@/mountApp', () => ({ mountApp: calls.mountApp }))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_ENABLE_MOCKS', 'true')
  document.body.innerHTML = '<div id="app"></div>'
  calls.startMocking.mockResolvedValue(undefined)
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('application bootstrap', () => {
  it('waits for interception before importing and mounting the application', async () => {
    let release: (() => void) | undefined
    calls.startMocking.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    const { applicationReady } = await import('/@/main')
    await vi.waitFor(() => expect(calls.startMocking).toHaveBeenCalledOnce())
    expect(calls.mountApp).not.toHaveBeenCalled()
    release?.()
    await applicationReady
    expect(calls.mountApp).toHaveBeenCalledOnce()
  })

  it.each([
    ['false', true],
    ['true', false],
    ['', true]
  ])('keeps mocking disabled for flag=%s and DEV=%s', async (flag, dev) => {
    vi.stubEnv('VITE_ENABLE_MOCKS', flag)
    vi.stubEnv('DEV', dev)
    const { applicationReady } = await import('/@/main')
    await applicationReady
    expect(calls.startMocking).not.toHaveBeenCalled()
    expect(calls.mountApp).toHaveBeenCalledOnce()
  })

  it('shows an error without starting API consumers when worker startup fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    calls.startMocking.mockRejectedValue(new Error('worker unavailable'))
    const { applicationReady } = await import('/@/main')
    await applicationReady
    expect(calls.mountApp).not.toHaveBeenCalled()
    expect(document.querySelector('#app')?.textContent).toContain(
      'アプリを起動できませんでした'
    )
  })
})
