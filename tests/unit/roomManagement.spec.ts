// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import type { components } from '/@/lib/api'
import RoomManagementPage from '/@/pages/RoomManagementPage.vue'
import { routes } from '/@/router'

type Room = components['schemas']['ResponseRoom']
type User = components['schemas']['ResponseUser']

const apiMocks = vi.hoisted(() => ({
  GET: vi.fn(),
  POST: vi.fn(),
  DELETE: vi.fn()
}))

const userMock = vi.hoisted(() => ({
  me: {
    __v_isRef: true,
    value: undefined as User | undefined
  },
  state: {
    __v_isRef: true,
    value: 'success'
  }
}))

vi.mock('/@/lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('/@/lib/api')>()
  return {
    ...original,
    apiClient: apiMocks
  }
})

vi.mock('/@/features/user/composables/useMe', () => ({
  useMe: () => userMock
}))

const privilegedUser: User = {
  userId: 'user-1',
  name: 'admin',
  displayName: '管理者',
  icon: 'https://example.com/icon.png',
  privileged: true,
  state: 1
}

const room = (
  roomId: string,
  place: string,
  timeStart: string,
  timeEnd: string
): Room => ({
  roomId,
  place,
  timeStart,
  timeEnd,
  verified: true,
  admins: [],
  createdBy: 'user-1',
  createdAt: '2026-08-01T00:00:00+09:00',
  updatedAt: '2026-08-01T00:00:00+09:00'
})

const mountPage = () =>
  mount(RoomManagementPage, {
    global: {
      stubs: {
        AppHeader: true
      }
    }
  })

describe('RoomManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userMock.me.value = privilegedUser
    userMock.state.value = 'success'
    apiMocks.GET.mockResolvedValue({ data: [] })
    apiMocks.POST.mockResolvedValue({ data: [] })
    apiMocks.DELETE.mockResolvedValue({})
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('進行中と将来の部屋だけを開始時刻順に表示する', async () => {
    apiMocks.GET.mockResolvedValue({
      data: [
        room(
          'future-late',
          'S2-202',
          '2099-01-02T13:00:00+09:00',
          '2099-01-02T18:00:00+09:00'
        ),
        room(
          'expired',
          'S2-199',
          '2000-01-01T09:00:00+09:00',
          '2000-01-01T10:00:00+09:00'
        ),
        room(
          'ongoing',
          'S2-201',
          '2000-01-01T09:00:00+09:00',
          '2099-01-01T18:00:00+09:00'
        )
      ]
    })

    const wrapper = mountPage()
    await flushPromises()

    const rows = wrapper.findAll('[data-testid="room-row"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('S2-201')
    expect(rows[1].text()).toContain('S2-202')
    expect(wrapper.text()).not.toContain('S2-199')
    expect(apiMocks.GET).toHaveBeenCalledWith('/rooms', {
      params: { query: { dateBegin: expect.any(String) } }
    })
  })

  it('取得失敗を空状態と区別して表示する', async () => {
    apiMocks.GET.mockResolvedValue({ error: { status: 500 } })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.get('[data-testid="rooms-error"]').text()).toContain(
      '取得に失敗しました'
    )
    expect(wrapper.find('[data-testid="rooms-empty"]').exists()).toBe(false)
  })

  it('取得中と空状態を区別して表示する', async () => {
    let resolveGet: (value: { data: Room[] }) => void = () => undefined
    apiMocks.GET.mockReturnValue(
      new Promise<{ data: Room[] }>((resolve) => {
        resolveGet = resolve
      })
    )

    const wrapper = mountPage()
    expect(wrapper.find('[data-testid="rooms-loading"]').exists()).toBe(true)

    resolveGet({ data: [] })
    await flushPromises()

    expect(wrapper.find('[data-testid="rooms-loading"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="rooms-empty"]').text()).toContain(
      '進行中または今後の進捗部屋はありません'
    )
  })

  it('削除確認を取り消すとDELETEを呼ばない', async () => {
    apiMocks.GET.mockResolvedValue({
      data: [
        room(
          'room-1',
          'S2-201',
          '2099-01-01T09:00:00+09:00',
          '2099-01-01T18:00:00+09:00'
        )
      ]
    })

    const wrapper = mountPage()
    await flushPromises()

    const deleteButton = wrapper.get('[data-testid="open-delete-dialog"]')
    expect(deleteButton.attributes('disabled')).toBeDefined()
    await wrapper.get('[data-testid="room-checkbox-room-1"]').setValue(true)
    expect(deleteButton.attributes('disabled')).toBeUndefined()
    await deleteButton.trigger('click')
    await wrapper.get('[data-testid="cancel-delete"]').trigger('click')

    expect(apiMocks.DELETE).not.toHaveBeenCalled()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('部分失敗時は成功分だけを除き，失敗分を選択状態で残す', async () => {
    apiMocks.GET.mockResolvedValue({
      data: [
        room(
          'success-room',
          'S2-201',
          '2099-01-01T09:00:00+09:00',
          '2099-01-01T18:00:00+09:00'
        ),
        room(
          'failed-room',
          'S2-202',
          '2099-01-02T09:00:00+09:00',
          '2099-01-02T18:00:00+09:00'
        )
      ]
    })
    apiMocks.DELETE.mockImplementation(
      (_path: string, options: { params: { path: { roomID: string } } }) =>
        Promise.resolve(
          options.params.path.roomID === 'failed-room'
            ? { error: { status: 500 } }
            : {}
        )
    )

    const wrapper = mountPage()
    await flushPromises()
    await wrapper
      .get('[data-testid="room-checkbox-success-room"]')
      .setValue(true)
    await wrapper
      .get('[data-testid="room-checkbox-failed-room"]')
      .setValue(true)
    await wrapper.get('[data-testid="open-delete-dialog"]').trigger('click')
    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')
    await flushPromises()

    expect(apiMocks.DELETE).toHaveBeenCalledTimes(2)
    expect(apiMocks.DELETE).toHaveBeenCalledWith('/rooms/{roomID}', {
      params: { path: { roomID: 'success-room' } }
    })
    expect(apiMocks.DELETE).toHaveBeenCalledWith('/rooms/{roomID}', {
      params: { path: { roomID: 'failed-room' } }
    })
    const remainingRows = wrapper.findAll('[data-testid="room-row"]')
    expect(remainingRows).toHaveLength(1)
    expect(remainingRows[0].text()).not.toContain('S2-201')
    expect(remainingRows[0].text()).toContain('S2-202')
    expect(
      wrapper.get<HTMLInputElement>('[data-testid="room-checkbox-failed-room"]')
        .element.checked
    ).toBe(true)
    expect(wrapper.get('[data-testid="delete-error"]').text()).toContain(
      '1件の削除に失敗しました'
    )
  })

  it('削除中は確認ボタンを無効化して二重送信しない', async () => {
    let resolveDelete: (value: object) => void = () => undefined
    apiMocks.GET.mockResolvedValue({
      data: [
        room(
          'room-1',
          'S2-201',
          '2099-01-01T09:00:00+09:00',
          '2099-01-01T18:00:00+09:00'
        )
      ]
    })
    apiMocks.DELETE.mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = resolve
      })
    )

    const wrapper = mountPage()
    await flushPromises()
    await wrapper.get('[data-testid="room-checkbox-room-1"]').setValue(true)
    await wrapper.get('[data-testid="open-delete-dialog"]').trigger('click')
    const confirmButton = wrapper.get('[data-testid="confirm-delete"]')
    await confirmButton.trigger('click')

    expect(confirmButton.attributes('disabled')).toBeDefined()
    await confirmButton.trigger('click')
    expect(apiMocks.DELETE).toHaveBeenCalledTimes(1)

    resolveDelete({})
    await flushPromises()
  })

  it('CSV登録成功時だけ入力を空にして一覧を再取得する', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const csvInput = wrapper.get<HTMLTextAreaElement>('#csv-input')
    await csvInput.setValue('Subject,Location\n進捗部屋,S2-201')
    await wrapper.get('[data-testid="submit-csv"]').trigger('click')
    await flushPromises()

    expect(apiMocks.POST).toHaveBeenCalledTimes(1)
    expect(csvInput.element.value).toBe('')
    expect(apiMocks.GET).toHaveBeenCalledTimes(2)

    apiMocks.POST.mockResolvedValueOnce({ error: { status: 400 } })
    await csvInput.setValue('invalid csv')
    await wrapper.get('[data-testid="submit-csv"]').trigger('click')
    await flushPromises()

    expect(csvInput.element.value).toBe('invalid csv')
    expect(apiMocks.GET).toHaveBeenCalledTimes(2)
    expect(wrapper.get('[data-testid="csv-error"]').text()).toContain(
      '登録に失敗しました'
    )
  })

  it('CSV登録中は送信ボタンを無効化して二重送信しない', async () => {
    let resolvePost: (value: object) => void = () => undefined
    apiMocks.POST.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve
      })
    )

    const wrapper = mountPage()
    await flushPromises()
    await wrapper
      .get('#csv-input')
      .setValue('Subject,Location\n進捗部屋,S2-201')
    const submitButton = wrapper.get('[data-testid="submit-csv"]')
    await submitButton.trigger('click')

    expect(submitButton.attributes('disabled')).toBeDefined()
    await submitButton.trigger('click')
    expect(apiMocks.POST).toHaveBeenCalledTimes(1)

    resolvePost({ data: [] })
    await flushPromises()
  })

  it('非特権ユーザーには管理操作を表示しない', async () => {
    userMock.me.value = { ...privilegedUser, privileged: false }

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.get('[data-testid="forbidden"]').text()).toContain(
      '特権ユーザーだけが利用できます'
    )
    expect(wrapper.find('#csv-input').exists()).toBe(false)
    expect(wrapper.find('[data-testid="open-delete-dialog"]').exists()).toBe(
      false
    )
    expect(apiMocks.GET).not.toHaveBeenCalled()
  })
})

describe('進捗部屋管理ルート', () => {
  it('/rooms/newを/rooms/manageへ転送し，既存の/roomsを維持する', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })

    await router.push('/rooms/new')

    expect(router.currentRoute.value.fullPath).toBe('/rooms/manage')
    expect(router.resolve('/rooms').name).toBe('rooms')
  })

  it('ヘッダーの管理導線を特権ユーザーだけに表示する', async () => {
    userMock.me.value = privilegedUser
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/')
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        stubs: {
          DropdownMenu: {
            template: '<div><slot name="trigger" /><slot /></div>'
          },
          UserIcon: true
        }
      }
    })

    expect(wrapper.find('a[href="/rooms/manage"]').exists()).toBe(true)
    wrapper.unmount()

    userMock.me.value = { ...privilegedUser, privileged: false }
    const nonPrivilegedWrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        stubs: {
          DropdownMenu: {
            template: '<div><slot name="trigger" /><slot /></div>'
          },
          UserIcon: true
        }
      }
    })

    expect(nonPrivilegedWrapper.find('a[href="/rooms/manage"]').exists()).toBe(
      false
    )
  })
})
