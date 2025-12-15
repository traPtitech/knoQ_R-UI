import { ref } from 'vue'
import type { ResponseDraftEvent, ResponseDraftEventDetail } from '../types'
import { mockApi } from '../mock'

export const useDraftEvents = () => {
  const draftEvents = ref<ResponseDraftEvent[]>([])
  const currentDraftEvent = ref<ResponseDraftEventDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getDraftEvents = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 本番APIに置き換え
      const data = await mockApi.getDraftEvents()
      draftEvents.value = data
    } catch (e) {
      error.value = 'draftイベント一覧の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const getDraftEvent = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 本番APIに置き換え
      const data = await mockApi.getDraftEvent(id)
      currentDraftEvent.value = data
    } catch (e) {
      error.value = 'draftイベントの取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const createDraftEvent = async (
    data: Omit<
      ResponseDraftEventDetail,
      'draftEventId' | 'status' | 'createdAt' | 'updatedAt'
    >
  ) => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 本番APIに置き換え
      const result = await mockApi.createDraftEvent(data)
      return result
    } catch (e) {
      error.value = 'draftイベントの作成に失敗しました'
      console.error(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const deleteDraftEvent = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 本番APIに置き換え
      await mockApi.deleteDraftEvent(id)
    } catch (e) {
      error.value = 'draftイベントの削除に失敗しました'
      console.error(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    draftEvents,
    currentDraftEvent,
    isLoading,
    error,
    getDraftEvents,
    getDraftEvent,
    createDraftEvent,
    deleteDraftEvent
  }
}
