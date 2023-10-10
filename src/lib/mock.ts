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

type Resolver = ResponseResolver<
  RestRequest<never, PathParams<string>>,
  RestContext,
  DefaultBodyType
>
const _mockApi = <Paths extends {}>() => {
  const get = <P extends PathsWithMethod<Paths, 'get'>>(path: P, resolver: Resolver) =>
    rest.get(BASE_URL + (path as string), resolver)
  const post = <P extends PathsWithMethod<Paths, 'post'>>(path: P, resolver: Resolver) =>
    rest.post(BASE_URL + (path as string), resolver)
  const put = <P extends PathsWithMethod<Paths, 'put'>>(path: P, resolver: Resolver) =>
    rest.put(BASE_URL + (path as string), resolver)
  const patch = <P extends PathsWithMethod<Paths, 'patch'>>(path: P, resolver: Resolver) =>
    rest.patch(BASE_URL + (path as string), resolver)
  const _delete = <P extends PathsWithMethod<Paths, 'delete'>>(path: P, resolver: Resolver) =>
    rest.delete(BASE_URL + (path as string), resolver)
  return {
    get,
    post,
    put,
    patch,
    delete: _delete
  }
}

export const mockApi = _mockApi<paths>()
