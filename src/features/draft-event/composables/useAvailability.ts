import { ref } from 'vue'
import type { ResponseAvailability } from '../types'
import { mockApi } from '../mock'

export const useAvailability = () => {
  const myAvailability = ref<ResponseAvailability | null>(null)
  const allAvailabilities = ref<ResponseAvailability[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const getMyAvailability = async (draftEventId: string, userId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await mockApi.getMyAvailability(draftEventId, userId)
      myAvailability.value = data
    } catch (e) {
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
      const data = await mockApi.getAvailabilities(draftEventId)
      allAvailabilities.value = data
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
      const data = await mockApi.saveAvailability(draftEventId, userId, {
        slotIds,
        comment
      })
      myAvailability.value = data
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
    getMyAvailability,
    getAllAvailabilities,
    saveAvailability
  }
}
