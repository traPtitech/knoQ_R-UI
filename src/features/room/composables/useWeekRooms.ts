import { ref, watch, type Ref } from 'vue'
import { apiClient } from '/@/lib/api'
import type { KnoqEvent, RoomWithEvents, Room } from '/@/features/room/types'

type FetchState = 'idle' | 'pending' | 'success' | 'error'

export const useWeekRooms = (dateBegin: Ref<string>, dateEnd: Ref<string>) => {
  const rooms = ref<RoomWithEvents[]>([])
  const state = ref<FetchState>('idle')
  const error = ref<unknown>(null)

  const fetchWeek = async () => {
    state.value = 'pending'
    error.value = null
    try {
      const [roomsRes, eventsRes] = await Promise.all([
        apiClient.GET('/rooms', {
          params: {
            query: { dateBegin: dateBegin.value, dateEnd: dateEnd.value }
          }
        }),
        apiClient.GET('/events', {
          params: {
            query: { dateBegin: dateBegin.value, dateEnd: dateEnd.value }
          }
        })
      ])

      const roomList: Room[] = roomsRes.data ?? []
      const eventList: KnoqEvent[] = eventsRes.data ?? []

      const eventsByRoom = new Map<string, KnoqEvent[]>()
      eventList.forEach((ev) => {
        const bucket = eventsByRoom.get(ev.roomId)
        if (bucket) {
          bucket.push(ev)
          return
        }
        eventsByRoom.set(ev.roomId, [ev])
      })

      rooms.value = roomList.map((r) => ({
        ...r,
        events: (eventsByRoom.get(r.roomId) ?? []).sort((a, b) =>
          a.timeStart.localeCompare(b.timeStart)
        )
      }))
      state.value = 'success'
    } catch (e) {
      error.value = e
      state.value = 'error'
    }
  }

  watch([dateBegin, dateEnd], fetchWeek, { immediate: true })

  return { rooms, state, error, refetch: fetchWeek }
}
