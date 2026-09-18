// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { environment, mountPage, clickButton } from './mockUiSupport'
import { mockApiUrl } from '/@/mocks/http'

const { default: DraftEventManage } = await import(
  '/@/pages/DraftEventManage.vue'
)
const { default: CreateEvent } = await import('/@/pages/CreateEvent.vue')
const { default: SelectMenu } = await import('/@/components/UI/SelectMenu.vue')
const { context, server } = environment

const prepareCreation = async (stock: boolean) => {
  const draft = context.state.draftEvents[0]
  const slot = draft.candidateSlots[0]
  const {
    wrapper: manage,
    router,
    pinia
  } = await mountPage(
    DraftEventManage,
    `/draft-events/${draft.draftEventId}/manage`
  )
  await vi.waitFor(() =>
    expect(manage.find('#manage-time-start').exists()).toBe(true)
  )
  await manage.get('#manage-time-start').setValue(slot.timeStart.slice(0, 16))
  await manage.get('#manage-time-end').setValue(slot.timeEnd.slice(0, 16))
  await clickButton(manage, 'この時間でイベント作成')
  await vi.waitFor(() =>
    expect(router.currentRoute.value.name).toBe('create_event')
  )
  manage.unmount()
  const wrapper = mount(CreateEvent, {
    global: { plugins: [router, pinia], stubs: { AppHeader: true } }
  })
  await vi.waitFor(() =>
    expect(wrapper.find('#event-name').exists()).toBe(true)
  )
  expect(wrapper.get('#event-name').element.value).toBe(draft.name)
  expect(wrapper.get('#time-start').element.value).toBe(
    slot.timeStart.slice(0, 16)
  )
  const group = context.state.groups[0]
  wrapper
    .findAllComponents(SelectMenu)[0]
    .vm.$emit('select', { id: group.groupId, name: group.name })
  if (stock) {
    const room = context.state.rooms.find(
      (item) =>
        Date.parse(item.timeStart) <= Date.parse(slot.timeStart) &&
        Date.parse(item.timeEnd) >= Date.parse(slot.timeEnd)
    )!
    wrapper
      .findAllComponents(SelectMenu)[1]
      .vm.$emit('select', { id: room.roomId, name: room.place })
  } else {
    await wrapper.get('#event-place').setValue('オンライン')
  }
  return { wrapper, router, draft }
}

describe('draft to event creation through MSW', () => {
  it.each([true, false])(
    'creates an event and confirms the draft (existing room=%s)',
    async (stock) => {
      const before = context.state.events.length
      const { wrapper, router, draft } = await prepareCreation(stock)
      try {
        await clickButton(wrapper, 'イベントを作成')
        await vi.waitFor(() =>
          expect(router.currentRoute.value.path).toMatch(
            /^\/events\/[a-f\d-]+$/
          )
        )
        expect(context.state.events).toHaveLength(before + 1)
        expect(draft.status).toBe('confirmed')
        expect(draft.confirmedTimeStart).toBe(
          context.state.events.at(-1)?.timeStart
        )
        const response = await fetch(
          mockApiUrl(`/events/${context.state.events.at(-1)?.eventId}`)
        )
        expect((await response.json()).name).toBe(draft.name)
      } finally {
        wrapper.unmount()
      }
    }
  )

  it('does not confirm a draft after a bodyless event creation failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const confirm = vi.fn()
    server.use(
      http.post(
        mockApiUrl('/events'),
        () => new HttpResponse(null, { status: 400 })
      ),
      http.post(mockApiUrl('/draft-events/:id/confirm'), () => {
        confirm()
        return HttpResponse.json({})
      })
    )
    const before = context.state.events.length
    const { wrapper, draft } = await prepareCreation(false)
    try {
      await clickButton(wrapper, 'イベントを作成')
      await vi.waitFor(() =>
        expect(wrapper.text()).toContain('イベントの作成に失敗しました')
      )
      expect(confirm).not.toHaveBeenCalled()
      expect(context.state.events).toHaveLength(before)
      expect(draft.status).toBe('open')
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps the created event and prevents duplicate submission if confirmation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(
      http.post(mockApiUrl('/draft-events/:id/confirm'), () =>
        HttpResponse.json({ message: '確定できません' }, { status: 500 })
      )
    )
    const before = context.state.events.length
    const { wrapper, draft } = await prepareCreation(false)
    try {
      await clickButton(wrapper, 'イベントを作成')
      await vi.waitFor(() =>
        expect(wrapper.text()).toContain('日程調整は未確定のままです')
      )
      expect(context.state.events).toHaveLength(before + 1)
      expect(draft.status).toBe('open')
      expect(
        wrapper
          .find(`a[href="/events/${context.state.events.at(-1)?.eventId}"]`)
          .exists()
      ).toBe(true)
      const submit = wrapper
        .findAll('button')
        .find((item) => item.text() === 'イベントを作成')!
      expect(submit.element.disabled).toBe(true)
      await submit.trigger('click')
      expect(context.state.events).toHaveLength(before + 1)
    } finally {
      wrapper.unmount()
    }
  })
})
