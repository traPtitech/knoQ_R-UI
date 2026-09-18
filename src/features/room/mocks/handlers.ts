import { http, HttpResponse, type RequestHandler } from 'msw'
import { mockApiUrl } from '/@/mocks/http'
import type { MockContext } from '/@/mocks/types'

export const createRoomHandlers = (context: MockContext): RequestHandler[] => [
  http.get(mockApiUrl('/rooms'), ({ request }) => {
    const query = new URL(request.url).searchParams
    const begin = query.get('dateBegin')
    const end = query.get('dateEnd')
    return HttpResponse.json(
      context.state.rooms
        .filter(
          (room) => !begin || Date.parse(room.timeStart) >= Date.parse(begin)
        )
        .filter((room) => !end || Date.parse(room.timeStart) <= Date.parse(end))
        .toSorted(
          (left, right) =>
            Date.parse(left.timeStart) - Date.parse(right.timeStart)
        )
    )
  })
]
