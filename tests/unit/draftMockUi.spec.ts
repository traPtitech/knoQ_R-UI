// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { environment, mountPage, clickButton } from './mockUiSupport'
import { mockApiUrl } from '/@/mocks/http'

const { default: DraftEventList } = await import('/@/pages/DraftEventList.vue')
const { default: DraftEventDetail } = await import(
  '/@/pages/DraftEventDetail.vue'
)
const { context, server } = environment

describe('draft pages through MSW', () => {
  it('shows invited drafts and answered state after the current user arrives', async () => {
    const { wrapper } = await mountPage(DraftEventList)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain(context.state.draftEvents[0].name)
      expect(wrapper.text()).toContain('回答済')
      expect(wrapper.text()).toContain('未回答')
    })
  })

  it.each(['empty', 'error'] as const)(
    'renders the %s scenario',
    async (scenario) => {
      environment.reset({ scenario })
      const { wrapper } = await mountPage(DraftEventList)
      await vi.waitFor(() =>
        expect(wrapper.text()).toContain(
          scenario === 'empty'
            ? '該当するイベントがありません'
            : '日程調整一覧の取得に失敗しました'
        )
      )
    }
  )

  it('keeps the loading state until a delayed HTTP response arrives', async () => {
    let release: (() => void) | undefined
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(mockApiUrl('/draft-events'), async () => {
        await pending
        return HttpResponse.json([])
      })
    )
    const { wrapper } = await mountPage(DraftEventList)
    expect(wrapper.find('[animate-pulse]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('該当するイベントがありません')
    release?.()
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('該当するイベントがありません')
    )
  })

  it('loads a saved answer when /users/me arrives after the draft', async () => {
    const answer = context.state.availabilities.find(
      (item) => item.userId === context.state.currentUserId
    )!
    let release: (() => void) | undefined
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(mockApiUrl('/users/me'), async () => {
        await pending
        return HttpResponse.json(context.state.users[0])
      })
    )
    const { wrapper } = await mountPage(
      DraftEventDetail,
      `/draft-events/${answer.draftEventId}`
    )
    expect(wrapper.text()).toContain('読み込み中')
    release?.()
    await vi.waitFor(() => expect(wrapper.find('textarea').exists()).toBe(true))
    expect(wrapper.get('textarea').element.value).toBe(answer.comment ?? '')
    expect(wrapper.text()).toContain('回答を更新')
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(
      answer.slotIds.length
    )
  })

  it('saves an empty initial answer, then updates it without adding a second respondent', async () => {
    const draft = context.state.draftEvents[0]
    const before = context.state.availabilities.filter(
      (item) => item.draftEventId === draft.draftEventId
    ).length
    const { wrapper } = await mountPage(
      DraftEventDetail,
      `/draft-events/${draft.draftEventId}`
    )
    await vi.waitFor(() => expect(wrapper.text()).toContain('回答を送信'))
    await clickButton(wrapper, '回答を送信')
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('回答を保存しました')
    )
    const getAnswers = () =>
      context.state.availabilities.filter(
        (item) => item.draftEventId === draft.draftEventId
      )
    expect(getAnswers()).toHaveLength(before + 1)
    expect(
      getAnswers().find((item) => item.userId === context.state.currentUserId)
        ?.slotIds
    ).toEqual([])
    await wrapper.findAll('button[aria-pressed]')[0].trigger('mousedown')
    document.dispatchEvent(new MouseEvent('mouseup'))
    await wrapper.get('textarea').setValue('途中から参加します')
    await clickButton(wrapper, '回答を更新')
    await vi.waitFor(() =>
      expect(
        getAnswers().find((item) => item.userId === context.state.currentUserId)
          ?.comment
      ).toBe('途中から参加します')
    )
    expect(getAnswers()).toHaveLength(before + 1)
    expect(
      getAnswers().find((item) => item.userId === context.state.currentUserId)
        ?.slotIds
    ).toHaveLength(1)
  })

  it('retains unsaved input and shows a failed answer response', async () => {
    const draft = context.state.draftEvents[0]
    server.use(
      http.put(mockApiUrl('/draft-events/:id/availabilities/:userId'), () =>
        HttpResponse.json({ message: '保存できません' }, { status: 500 })
      )
    )
    const { wrapper } = await mountPage(
      DraftEventDetail,
      `/draft-events/${draft.draftEventId}`
    )
    await vi.waitFor(() => expect(wrapper.find('textarea').exists()).toBe(true))
    await wrapper.get('textarea').setValue('保存したいコメント')
    await clickButton(wrapper, '回答を送信')
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('保存に失敗しました')
    )
    expect(wrapper.get('textarea').element.value).toBe('保存したいコメント')
    expect(
      context.state.availabilities.some(
        (item) =>
          item.draftEventId === draft.draftEventId &&
          item.userId === context.state.currentUserId
      )
    ).toBe(false)
  })

  it('shows a detail HTTP failure as an error', async () => {
    server.use(
      http.get(mockApiUrl('/draft-events/:id'), () =>
        HttpResponse.json(
          { message: '詳細の取得に失敗しました' },
          { status: 500 }
        )
      )
    )
    const { wrapper } = await mountPage(
      DraftEventDetail,
      `/draft-events/${context.state.draftEvents[0].draftEventId}`
    )
    await vi.waitFor(() =>
      expect(wrapper.get('[role="alert"]').text()).toContain(
        '日程調整の取得に失敗しました'
      )
    )
  })
})
