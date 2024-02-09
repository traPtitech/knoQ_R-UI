import createClient, { FetchOptions } from 'openapi-fetch'
import useSWRV from 'swrv'
import { paths } from './api-schema'
import { FilterKeys, PathsWithMethod } from 'openapi-typescript-helpers'
import { IConfig, fetcherFn } from 'swrv/dist/types'

export const BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api'

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include'
})
