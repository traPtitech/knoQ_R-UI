import { computed, isRef, Ref } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'

export type SelectItem = { id: string; name: string }

export const useUsers = () => {
  const { data: users, error } = useApiFetch('/users', {})

  const getUsersByIds = (ids: Ref<string[] | string> | string[] | string) => {
    const idsRef = computed(() => {
      const idsValue = isRef(ids) ? ids.value : ids
      if (typeof idsValue === 'string') return [idsValue]
      return idsValue
    })
    return computed(() =>
      users.value?.filter((user) => idsRef.value.includes(user.userId))
    )
  }

  const getUserSelectItems = (
    excludeIds: Ref<string[]> | string[] = []
  ) => {
    return computed<SelectItem[]>(() => {
      if (!users.value) return []
      const excludeIdsValue = isRef(excludeIds) ? excludeIds.value : excludeIds
      return users.value
        .filter((u) => !excludeIdsValue.includes(u.userId))
        .map((u) => ({ id: u.userId, name: u.name }))
    })
  }

  return {
    users,
    getUsersByIds,
    getUserSelectItems,
    error
  }
}
