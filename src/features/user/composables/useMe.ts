import { useApiFetch } from '/@/composables/useApiFetch'

export const useMe = () => {
  const {
    data: me,
    error,
    isValidating,
    state
  } = useApiFetch('/users/me', {}, {})
  return {
    me,
    error,
    isValidating,
    state
  }
}
