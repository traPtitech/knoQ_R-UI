import createClient, { FetchOptions } from 'openapi-fetch'
import useSWRV from 'swrv'
import { paths } from '../api/schema'
import { FilterKeys, PathsWithMethod } from 'openapi-typescript-helpers'
import { IConfig, fetcherFn } from 'swrv/dist/types'

export const useApiSWRV = <P extends PathsWithMethod<paths, 'get'>>(
  url: P,
  init: FetchOptions<FilterKeys<paths[P], 'get'>>,
  config?: IConfig<any, fetcherFn<any>> | undefined
) => {
  const { GET } = createClient<paths>({
    baseUrl: 'http://localhost:6006/api',
    credentials: 'include'
  })
  return {
    ...useSWRV([url, init], async () => (await GET(url, init)).data, config)
  }
}
