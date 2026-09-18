import { ref } from 'vue'
import type { ResponseAvailability } from '/@/features/draft-event/types'
import { draftApiClient } from '/@/features/draft-event/api'

export const useAvailability = () => {
  const myAvailability = ref<ResponseAvailability | null>(null)
  const allAvailabilities = ref<ResponseAvailability[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const getMyAllAvailabilities = async (userId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.GET('/users/{userId}/draft-availabilities', {
        params: { path: { userId } }
      })
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      allAvailabilities.value = data ?? []
    } catch (e) {
      error.value = '回答一覧の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const getMyAvailability = async (draftEventId: string, userId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.GET(
        '/draft-events/{id}/availabilities/{userId}',
        { params: { path: { id: draftEventId, userId } } }
      )
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      myAvailability.value = data ?? null
    } catch (e) {
      myAvailability.value = null
      error.value = '回答の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const getAllAvailabilities = async (draftEventId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.GET('/draft-events/{id}/availabilities', {
        params: { path: { id: draftEventId } }
      })
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      allAvailabilities.value = data ?? []
    } catch (e) {
      error.value = '回答一覧の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const saveAvailability = async (
    draftEventId: string,
    userId: string,
    slotIds: string[],
    comment?: string | null
  ) => {
    isSaving.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.PUT(
        '/draft-events/{id}/availabilities/{userId}',
        {
          params: { path: { id: draftEventId, userId } },
          body: { slotIds, comment }
        }
      )
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      if (!data) throw new Error('回答の応答がありません')
      myAvailability.value = data ?? null
      return data
    } catch (e) {
      error.value = '回答の保存に失敗しました'
      console.error(e)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  return {
    myAvailability,
    allAvailabilities,
    isLoading,
    isSaving,
    error,
    getMyAllAvailabilities,
    getMyAvailability,
    getAllAvailabilities,
    saveAvailability
  }
}
