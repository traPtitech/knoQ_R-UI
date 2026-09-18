import { http, HttpResponse, type RequestHandler } from 'msw'
import { userIconSvg } from '/@/features/user/mocks/factories'
import { mockApiUrl, mockError } from '/@/mocks/http'
import type { MockContext } from '/@/mocks/types'

export const createUserHandlers = (context: MockContext): RequestHandler[] => [
  http.get(mockApiUrl('/users'), ({ request }) => {
    const includeSuspended =
      new URL(request.url).searchParams.get('include-suspended') === 'true'
    return HttpResponse.json(
      context.state.users.filter((user) => includeSuspended || user.state === 1)
    )
  }),
  http.get(mockApiUrl('/users/me'), () => {
    const user = context.state.users.find(
      (user) => user.userId === context.state.currentUserId
    )
    return user
      ? HttpResponse.json(user)
      : mockError('Mock current user not found', 404)
  }),
  http.get('https://q.trap.jp/api/v3/public/icon/:userId', ({ params }) => {
    const user = context.state.users.find(
      (user) => user.userId === params.userId || user.name === params.userId
    )
    if (!user) return mockError('Mock user icon not found', 404)
    return new HttpResponse(userIconSvg(user.userId), {
      headers: { 'Content-Type': 'image/svg+xml' }
    })
  })
]
