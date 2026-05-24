import { ref, computed } from 'vue'
import { apiClient } from '/@/lib/api'
import type { Group } from '/@/features/group/types'

type SelectItem = { id: string; name: string }

export const useGroups = () => {
  const groups = ref<Group[]>([])
  const { GET } = apiClient

  const getGroups = async () => {
    const { data } = await GET('/groups')
    if (data) {
      groups.value = data
    }
  }

  const groupSelectItems = computed<SelectItem[]>(() =>
    groups.value.map((g) => ({ id: g.groupId, name: g.name }))
  )

  return {
    groups,
    getGroups,
    groupSelectItems
  }
}
