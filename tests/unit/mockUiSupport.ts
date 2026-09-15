import { afterAll, afterEach, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Component } from 'vue'
import { SWRVCache } from 'swrv'
import { createMockServer } from '/@/mocks/node'
import { onUnhandledMockRequest } from '/@/mocks/environment'

// Keep real fetching and SWRV behavior, but give each mount cycle its own data cache.
const cacheHolder = vi.hoisted(() => ({ cache: undefined as unknown }))
vi.mock('swrv', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swrv')>()
  return {
    ...actual,
    default: (...args: Parameters<typeof actual.default>) =>
      actual.default(args[0], args[1], {
        ...args[2],
        cache: cacheHolder.cache as InstanceType<typeof actual.SWRVCache>,
        dedupingInterval: 0,
        revalidateOnFocus: false,
        shouldRetryOnError: false
      })
  }
})

export const environment = createMockServer({
  seed: 42,
  now: '2026-09-15T00:00:00Z'
})
// openapi-fetch captures fetch at construction; import pages only after listen.
environment.server.listen({ onUnhandledRequest: onUnhandledMockRequest })
let wrappers: VueWrapper[] = []
export const resetCache = () => {
  cacheHolder.cache = new SWRVCache()
}
beforeEach(() => {
  environment.reset({ scenario: 'default' })
  resetCache()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(environment.context.options.now))
})
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers = []
  environment.server.resetHandlers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
afterAll(() => environment.server.close())

export const mountPage = async (
  component: Component,
  path = '/draft-events'
) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/draft-events', name: 'DraftEventList', component },
      { path: '/draft-events/:id', name: 'DraftEventDetail', component },
      { path: '/draft-events/:id/manage', name: 'DraftEventManage', component },
      { path: '/events/new', name: 'create_event', component },
      { path: '/events/:id', name: 'event_detail', component },
      { path: '/:pathMatch(.*)*', component }
    ]
  })
  await router.push(path)
  await router.isReady()
  const pinia = createPinia()
  const wrapper = mount(component, {
    global: { plugins: [router, pinia], stubs: { AppHeader: true } }
  })
  wrappers.push(wrapper)
  return { wrapper, router, pinia }
}

export const clickButton = async (wrapper: VueWrapper, label: string) => {
  const button = wrapper.findAll('button').find((item) => item.text() === label)
  if (!button) throw new Error(`Button not found: ${label}`)
  await button.trigger('click')
}
