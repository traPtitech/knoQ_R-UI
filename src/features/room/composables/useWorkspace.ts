import { computed } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'

export const useWorkspace = (dateBegin: string, dateEnd: string) => {
  const {
    data: rooms,
    error,
    isValidating,
    state
  } = useApiFetch('/rooms', { params: { query: { dateBegin, dateEnd } } }, {})
  const workspaces = computed(() => rooms.value?.filter((v) => v.verified))
  return {
    workspaces,
    error,
    isValidating,
    state
  }
}
