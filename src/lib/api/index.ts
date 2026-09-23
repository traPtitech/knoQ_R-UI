import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { BASE_URL } from '/@/lib/api/baseUrl'
export type { paths, components } from './schema'
export { BASE_URL } from '/@/lib/api/baseUrl'

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include'
})
