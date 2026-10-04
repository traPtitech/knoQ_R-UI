import { HttpResponse } from 'msw'
import { BASE_URL } from '/@/lib/api/baseUrl'

export const mockApiUrl = (path: string): string => `${BASE_URL}${path}`

export const mockError = (message: string, status = 400): Response =>
  HttpResponse.json({ message }, { status })

export const isMockApiRequest = (request: Request): boolean => {
  const url = new URL(request.url)
  const base = new URL(BASE_URL, url.origin)
  return (
    url.origin === base.origin &&
    (url.pathname === base.pathname ||
      url.pathname.startsWith(`${base.pathname}/`))
  )
}
