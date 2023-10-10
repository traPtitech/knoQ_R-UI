import createClient, { FetchOptions } from 'openapi-fetch'
import useSWRV from 'swrv'
import { paths } from '../api/schema'
import { FilterKeys, PathsWithMethod } from 'openapi-typescript-helpers'
import { IConfig, fetcherFn } from 'swrv/dist/types'
import { BASE_URL } from '../api'

const makeUseApiSWRV = <Paths extends {}>() => {
  const { GET } = createClient<Paths>({
    baseUrl: BASE_URL,
    credentials: 'include'
  })
  return <P extends PathsWithMethod<Paths, 'get'>>(
    url: P,
    init: FetchOptions<FilterKeys<Paths[P], 'get'>>,
    config?: IConfig<any, fetcherFn<any>> | undefined
  ) => {
    const initStr = JSON.stringify(init)
    return useSWRV([url, initStr], async () => (await GET(url, init)).data, config)
  }
}

export const useApiSWRV = makeUseApiSWRV<paths>()
