import { useApiFetch } from '/@/composables/useApiFetch'
import type { User } from '/@/features/user/types'

export const useUsers = () => {
  const { data: users, error } = useApiFetch<User[]>('/users')

  return {
    users,
    error
  }
}
