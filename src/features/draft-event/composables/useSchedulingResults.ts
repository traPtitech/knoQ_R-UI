import { ref } from 'vue'
import type { ResponseSchedulingResults } from '../types'
import { mockApi } from '../mock'

export const useSchedulingResults = () => {
  const schedulingResults = ref<ResponseSchedulingResults | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getSchedulingResults = async (draftEventId: string) => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 本番APIに置き換え
      const data = await mockApi.getSchedulingResults(draftEventId)
      schedulingResults.value = data
    } catch (e) {
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
