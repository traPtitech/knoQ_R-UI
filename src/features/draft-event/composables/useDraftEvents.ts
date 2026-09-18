import { ref } from 'vue'
import type {
  RequestDraftEvent,
  ResponseDraftEvent,
  ResponseDraftEventDetail
} from '/@/features/draft-event/types'
import { draftApiClient } from '/@/features/draft-event/api'

export const useDraftEvents = () => {
  const draftEvents = ref<ResponseDraftEvent[]>([])
  const currentDraftEvent = ref<ResponseDraftEventDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getDraftEvents = async () => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.GET('/draft-events')
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      draftEvents.value = data ?? []
    } catch (e) {
      error.value = '日程調整一覧の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const getDraftEvent = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.GET('/draft-events/{id}', {
        params: { path: { id } }
      })
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      currentDraftEvent.value = data ?? null
    } catch (e) {
      currentDraftEvent.value = null
      error.value = '日程調整の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const createDraftEvent = async (data: RequestDraftEvent) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data: result,
        error: apiError,
        response
      } = await draftApiClient.POST('/draft-events', { body: data })
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      if (!result) throw new Error('日程調整の応答がありません')
      return result
    } catch (e) {
      error.value = '日程調整の作成に失敗しました'
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
      const { error: apiError, response } = await draftApiClient.DELETE(
        '/draft-events/{id}',
        { params: { path: { id } } }
      )
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
    } catch (e) {
      error.value = '日程調整の削除に失敗しました'
      console.error(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const confirmDraftEvent = async (
    id: string,
    timeStart: string,
    timeEnd: string
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data: result,
        error: apiError,
        response
      } = await draftApiClient.POST('/draft-events/{id}/confirm', {
        params: { path: { id } },
        body: { timeStart, timeEnd }
      })
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      if (!result) throw new Error('日程調整の応答がありません')
      currentDraftEvent.value = result
      return result
    } catch (e) {
      error.value = '日程調整の確定に失敗しました'
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
    deleteDraftEvent,
    confirmDraftEvent
  }
}
