import { ref } from 'vue'
import { apiClient } from '/@/lib/api'
import type { KnoqEvent } from '/@/features/event/types'

export const useEvents = () => {
  const events = ref<KnoqEvent[]>([])
  const { GET } = apiClient

  const getEvents = async () => {
    const { data } = await GET('/events')
    if (data) {
      events.value = data
    }
  }

  return {
    events,
    getEvents
  }
}
