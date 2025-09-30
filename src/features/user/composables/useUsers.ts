import { computed, isRef, Ref } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'

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

  return {
    users,
    getUsersByIds,
    error
  }
}
