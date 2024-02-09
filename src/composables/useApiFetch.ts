import useSWRV, { IConfig } from 'swrv'
import { paths } from '../lib/api-schema'
import { apiClient } from '/@/lib/api'
import { FetchOptions } from 'openapi-fetch'
import { FilterKeys, PathsWithMethod } from 'openapi-typescript-helpers'
import { useSwrvState } from './useSwrvState'

export const useApiFetch = <P extends PathsWithMethod<paths, 'get'>>(
  path: P,
  init: FetchOptions<FilterKeys<paths[P], 'get'>>,
  config?: IConfig
) => {
  const swrv = useSWRV(
    [path, JSON.stringify(init)],
    async () => (await apiClient.GET(path, init)).data,
    config
  )
  const { state } = useSwrvState(swrv.data, swrv.error, swrv.isValidating)
  return {
    ...swrv,
    state
  }
}
