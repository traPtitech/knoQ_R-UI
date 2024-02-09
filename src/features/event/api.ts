import { useApiFetch } from '/@/composables/useApiFetch'
import { Schedule } from '/@/features/event/types'
import { apiClient } from '/@/lib/api'

export const fetchEvent = (eventID: string) => {
  const { data, error, mutate, state } = useApiFetch('/events/{eventID}', {
    params: { path: { eventID } }
  })
  return {
    event: data,
    error,
    mutate,
    state
  }
}

export const updateMyAttendance = async (
  eventID: string,
  schedule: Schedule
) => {
  await apiClient.PUT('/events/{eventID}/attendees/me', {
    params: { path: { eventID } },
    body: { schedule }
  })
}

export const fetchGroup = (groupID: string) => {
  const { data, error, mutate, state } = useApiFetch('/groups/{groupID}', {
    params: { path: { groupID } }
  })
  return {
    group: data,
    error,
    mutate,
    state
  }
}
