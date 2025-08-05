import { ref } from 'vue'
import { apiClient } from '/@/lib/api'
import type { Group } from '../types'

export const useGroups = () => {
  const groups = ref<Group[]>([])
  const { GET } = apiClient

  const getGroups = async () => {
    const { data } = await GET('/groups')
    if (data) {
      groups.value = data
    }
  }

  return {
    groups,
    getGroups
  }
}
