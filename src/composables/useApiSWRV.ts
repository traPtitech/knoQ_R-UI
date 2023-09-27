import createClient, { FetchOptions } from 'openapi-fetch'
import useSWRV from 'swrv'
import { paths } from '../api/schema'
import { FilterKeys, PathsWithMethod } from 'openapi-typescript-helpers'
import { IConfig, fetcherFn } from 'swrv/dist/types'

const makeUseApiSWRV = <Paths extends {}>() => {
  const { GET } = createClient<Paths>({
    baseUrl: 'http://localhost:6006/api',
    credentials: 'include'
  })
  return <P extends PathsWithMethod<Paths, 'get'>>(
    url: P,
    init: FetchOptions<FilterKeys<Paths[P], 'get'>>,
    config?: IConfig<any, fetcherFn<any>> | undefined
  ) => {
    return useSWRV([url, init], async () => (await GET(url, init)).data, config)
  }
}

export const useApiSWRV = makeUseApiSWRV<paths>()
