import createClient from 'openapi-fetch'
import { paths } from './schema'

export const BASE_URL =
  process.env.NODE_ENV === 'development' ? 'https://localhost:6006/api' : '/api'

export const client = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include'
})
