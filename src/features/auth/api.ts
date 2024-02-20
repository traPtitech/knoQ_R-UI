import { apiClient } from '/@/lib/api'

export const login = async () => await apiClient.POST('/authParams')
