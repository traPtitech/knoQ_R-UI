import { http, HttpResponse, type RequestHandler } from 'msw'
import { mockApiUrl, mockError } from '/@/mocks/http'
import type { MockContext } from '/@/mocks/types'

export const createGroupHandlers = (context: MockContext): RequestHandler[] => [
  http.get(mockApiUrl('/groups'), () =>
    HttpResponse.json(context.state.groups)
  ),
  http.get(mockApiUrl('/groups/:groupID'), ({ params }) => {
    const group = context.state.groups.find(
      (group) => group.groupId === params.groupID
    )
    return group
      ? HttpResponse.json(group)
      : mockError('Mock group not found', 404)
  })
]
