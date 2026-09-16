import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { useEventSearch } from '/@/features/event/composables/useEventSearch'
import { defaultEventSearchFilters } from '/@/features/event/eventSearch'
import { event, ids, now } from './eventSearchFixtures'

const { get, fetchOptions } = vi.hoisted(() => ({
  get: vi.fn(),
  fetchOptions: vi.fn()
}))
vi.mock('/@/composables/useApiFetch', () => ({ useApiFetch: fetchOptions }))
vi.mock('/@/lib/api', () => ({ apiClient: { GET: get } }))
const reply = (data: unknown, status = 200) => ({
  data,
  response: new Response(null, { status })
})
const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const candidateRequest = () => ({
  data: ref<Record<string, string>[] | undefined>(),
  error: ref<Error>(),
  isValidating: ref(false),
  mutate: vi.fn().mockResolvedValue(undefined)
})
let candidates: Record<string, ReturnType<typeof candidateRequest>>
let scope: EffectScope
let search: ReturnType<typeof useEventSearch>
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  get.mockReset()
  candidates = Object.fromEntries(
    ['/tags', '/users', '/groups'].map((path) => [path, candidateRequest()])
  )
  fetchOptions
    .mockReset()
    .mockImplementation((path: string) => candidates[path])
  scope = effectScope()
  search = scope.run(() => useEventSearch())!
})
afterEach(() => {
  scope.stop()
  vi.useRealTimers()
})

describe('イベント取得と状態', () => {
  it('初回取得中から成功へ遷移する', async () => {
    const request = deferred<ReturnType<typeof reply>>()
    get.mockReturnValueOnce(request.promise)
    const task = search.search()
    await nextTick()
    expect(search.state.value).toBe('pending')
    expect(search.isValidating.value).toBe(true)
    request.resolve(reply([event()]))
    await task
    await nextTick()
    expect(search.state.value).toBe('success')
    expect(search.events.value).toHaveLength(1)
  })
  it('フォームの複合条件をAPIへ渡し、自由語を結果へ反映する', async () => {
    Object.assign(search.filters, {
      tagIds: [ids.tag],
      userIds: [ids.user],
      groupIds: [ids.group],
      keyword: 'Vue'
    })
    get.mockResolvedValueOnce(
      reply([event(), event({ name: 'Go', description: '' })])
    )
    await search.search()
    expect(get).toHaveBeenCalledWith(
      '/events',
      expect.objectContaining({
        params: {
          query: {
            dateBegin: now.toISOString(),
            q: `tag==${ids.tag}&&user==${ids.user}&&group==${ids.group}`
          }
        }
      })
    )
    expect(search.events.value).toHaveLength(1)
  })
  it('不正な日付は送信しない', async () => {
    Object.assign(search.filters, {
      dateBegin: '2026-09-10',
      dateEnd: '2026-09-09'
    })
    await search.search()
    expect(get).not.toHaveBeenCalled()
    expect(search.validationError.value).toContain('終了日')
  })
  it('過去OFFかつ過去の期間はリクエストせず0件で成功する', async () => {
    search.filters.dateEnd = '2026-09-08'
    await search.search()
    await nextTick()
    expect(get).not.toHaveBeenCalled()
    expect(search.events.value).toEqual([])
    expect(search.state.value).toBe('success')
  })
  it('0件を成功として扱う', async () => {
    get.mockResolvedValueOnce(reply([]))
    await search.search()
    await nextTick()
    expect(search.state.value).toBe('success')
    expect(search.events.value).toEqual([])
  })
  it.each([401, 500])(
    'HTTP %sをエラーとして扱い、再試行で回復する',
    async (status) => {
      get
        .mockResolvedValueOnce(reply(undefined, status))
        .mockResolvedValueOnce(reply([event()]))
      await search.search()
      await nextTick()
      expect(search.state.value).toBe('error')
      expect(search.error.value?.message).toBe('イベントの取得に失敗しました。')
      await search.retry()
      await nextTick()
      expect(search.state.value).toBe('success')
      expect(search.error.value).toBeUndefined()
    }
  )
  it('通信失敗を表示し、再検索失敗時は前回の結果を消す', async () => {
    get.mockResolvedValueOnce(reply([event()]))
    await search.search()
    const request = deferred<ReturnType<typeof reply>>()
    get.mockReturnValueOnce(request.promise)
    const task = search.search()
    await nextTick()
    expect(search.state.value).toBe('validating')
    request.reject(new Error('offline'))
    await task
    await nextTick()
    expect(search.state.value).toBe('error')
    expect(search.events.value).toBeUndefined()
  })
  it.each(['success', 'error'])(
    '古い%s応答が新しい検索結果を上書きしない',
    async (outcome) => {
      const old = deferred<ReturnType<typeof reply>>()
      get
        .mockReturnValueOnce(old.promise)
        .mockResolvedValueOnce(reply([event({ name: 'new' })]))
      const first = search.search()
      const oldSignal = get.mock.calls[0][1].signal as AbortSignal
      const second = search.search()
      expect(oldSignal.aborted).toBe(true)
      await second
      if (outcome === 'success') old.resolve(reply([event({ name: 'old' })]))
      else old.reject(new Error('old failure'))
      await first
      expect(search.events.value?.[0].name).toBe('new')
      expect(search.error.value).toBeUndefined()
      expect(search.isValidating.value).toBe(false)
    }
  )
  it('再試行は未送信のフォーム編集ではなく直前の検索条件を使う', async () => {
    search.filters.keyword = 'Vue'
    get
      .mockResolvedValueOnce(reply(undefined, 500))
      .mockResolvedValueOnce(reply([event()]))
    await search.search()
    search.filters.keyword = 'Go'
    await search.retry()
    expect(search.events.value).toHaveLength(1)
  })
  it('リセットは全条件と検証エラーを消し、初期条件で再取得する', async () => {
    Object.assign(search.filters, {
      keyword: 'Go',
      tagIds: [ids.tag],
      userIds: [ids.user],
      groupIds: [ids.group],
      includePast: true,
      dateBegin: '2026-09-10',
      dateEnd: '2026-09-09'
    })
    await search.search()
    get.mockResolvedValueOnce(reply([event()]))
    await search.reset()
    expect(search.filters).toEqual(defaultEventSearchFilters())
    expect(search.validationError.value).toBe('')
    expect(search.events.value).toHaveLength(1)
  })
  it('画面を離れた後の応答を反映しない', async () => {
    const request = deferred<ReturnType<typeof reply>>()
    get.mockReturnValueOnce(request.promise)
    const task = search.search()
    scope.stop()
    request.resolve(reply([event()]))
    await task
    expect(search.events.value).toBeUndefined()
  })
})

describe('絞り込み候補', () => {
  it('ユーザー候補を共通取得処理に依頼し、直接APIを呼ばない', () => {
    expect(fetchOptions).toHaveBeenCalledWith('/users', {})
    expect(get).not.toHaveBeenCalled()
  })
  it('候補を並べ替えても共有データの順序を変えない', () => {
    candidates['/users'].data.value = [
      { userId: 'b', name: 'B' },
      { userId: 'a', name: 'A' }
    ]
    expect(search.users.value.map((user) => user.id)).toEqual(['a', 'b'])
    expect(candidates['/users'].data.value.map((user) => user.userId)).toEqual([
      'b',
      'a'
    ])
  })
  it('一部失敗しても取得済みの候補を保持し、失敗した一覧だけ再取得する', async () => {
    candidates['/tags'].data.value = [{ tagId: ids.tag, name: 'Vue' }]
    candidates['/users'].error.value = new Error('offline')
    expect(search.tags.value).toEqual([{ id: ids.tag, name: 'Vue' }])
    expect(search.optionsError.value).toBe('ユーザーの取得に失敗しました。')
    await search.loadOptions()
    expect(candidates['/users'].mutate).toHaveBeenCalledOnce()
    expect(candidates['/tags'].mutate).not.toHaveBeenCalled()
    expect(candidates['/groups'].mutate).not.toHaveBeenCalled()
    candidates['/users'].error.value = undefined
    expect(search.optionsError.value).toBe('')
  })
  it('未取得の候補は空配列とし、取得後に反映する', () => {
    expect(search.users.value).toEqual([])
    candidates['/users'].data.value = [{ userId: ids.user, name: 'user' }]
    expect(search.users.value).toEqual([{ id: ids.user, name: 'user' }])
  })
})
