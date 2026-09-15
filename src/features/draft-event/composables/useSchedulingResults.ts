import { ref } from 'vue'
import type { ResponseSchedulingResults } from '/@/features/draft-event/types'
import { draftApiClient } from '/@/features/draft-event/api'

export const useSchedulingResults = () => {
  const schedulingResults = ref<ResponseSchedulingResults | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getSchedulingResults = async (draftEventId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const {
        data,
        error: apiError,
        response
      } = await draftApiClient.GET('/draft-events/{id}/scheduling-results', {
        params: { path: { id: draftEventId } }
      })
      if (!response.ok)
        throw new Error(apiError?.message ?? '通信に失敗しました')
      schedulingResults.value = data ?? null
    } catch (e) {
      schedulingResults.value = null
      error.value = '投票結果の取得に失敗しました'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    schedulingResults,
    isLoading,
    error,
    getSchedulingResults
  }
}
