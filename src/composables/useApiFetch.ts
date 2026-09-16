import useSWRV, { IConfig } from 'swrv'
import { apiClient, paths } from '/@/lib/api'
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
    async () => {
      const { data, response } = await apiClient.GET(path, init)
      if (!response.ok)
        throw new Error(`取得に失敗しました (${response.status})`)
      return data
    },
    config
  )
  const { state } = useSwrvState(swrv.data, swrv.error, swrv.isValidating)
  return {
    ...swrv,
    state
  }
}
