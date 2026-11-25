import { describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'
import { useUsers } from '/@/features/user/composables/useUsers'

const { get, swrv } = vi.hoisted(() => ({ get: vi.fn(), swrv: vi.fn() }))
vi.mock('/@/lib/api', () => ({ apiClient: { GET: get } }))
vi.mock('swrv', () => ({ default: swrv }))

const setup = () => {
  swrv.mockReset().mockImplementation(() => ({
    data: ref(),
    error: ref(),
    isValidating: ref(false)
  }))
  get.mockReset()
  const scope = effectScope()
  scope.run(() => useApiFetch('/users', {}))
  scope.stop()
  return swrv.mock.calls[0][1] as () => Promise<unknown>
}

describe('共通API取得', () => {
  it.each([401, 500])(
    '取得関数はHTTP %sで例外を投げ、次の成功応答ではデータを返す',
    async (status) => {
      const fetcher = setup()
      get
        .mockResolvedValueOnce({ response: new Response(null, { status }) })
        .mockResolvedValueOnce({
          data: [],
          response: new Response(null, { status: 200 })
        })
      await expect(fetcher()).rejects.toThrow(String(status))
      await expect(fetcher()).resolves.toEqual([])
    }
  )
  it('同じ/users取得引数ならuseUsersと同じSWRVキーになる', () => {
    setup()
    const scope = effectScope()
    scope.run(() => useUsers())
    scope.stop()
    expect(swrv.mock.calls[0][0]).toEqual(swrv.mock.calls[1][0])
  })
})
