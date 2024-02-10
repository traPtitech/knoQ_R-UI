import createClient from 'openapi-fetch'
import type { paths } from './schema'
export type { paths, components } from './schema'

export const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api'

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include'
})
