import {
  DefaultBodyType,
  PathParams,
  ResponseResolver,
  RestContext,
  RestRequest,
  rest,
  setupWorker
} from 'msw'
import { PathsWithMethod } from 'openapi-typescript-helpers'
import { paths } from '../api/schema'
import { BASE_URL } from '../api'

const mswUrlFixer = (path: string): string => {
  const s = path.replace(/\{(.+)\}/, ':$1')
  return BASE_URL + s
}

type Resolver = ResponseResolver<
  RestRequest<never, PathParams<string>>,
  RestContext,
  DefaultBodyType
>
const _mockApi = <Paths extends {}>() => {
  const get = <P extends PathsWithMethod<Paths, 'get'>>(path: P, resolver: Resolver) =>
    rest.get(mswUrlFixer(path as string), resolver)
  const post = <P extends PathsWithMethod<Paths, 'post'>>(path: P, resolver: Resolver) =>
    rest.post(mswUrlFixer(path as string), resolver)
  const put = <P extends PathsWithMethod<Paths, 'put'>>(path: P, resolver: Resolver) =>
    rest.put(mswUrlFixer(path as string), resolver)
  const patch = <P extends PathsWithMethod<Paths, 'patch'>>(path: P, resolver: Resolver) =>
    rest.patch(mswUrlFixer(path as string), resolver)
  const _delete = <P extends PathsWithMethod<Paths, 'delete'>>(path: P, resolver: Resolver) =>
    rest.delete(mswUrlFixer(path as string), resolver)
  return {
    get,
    post,
    put,
    patch,
    delete: _delete
  }
}

export const mockApi = _mockApi<paths>()
