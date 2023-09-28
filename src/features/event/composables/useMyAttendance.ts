import { ComputedRef, Ref, computed, nextTick, ref } from 'vue'
import { KnoqEvent, KnoqEventDetail, Schedule } from '..'
import { useApiSWRV } from '../../../composables/useApiSWRV'
import useSWRV from 'swrv'
import { components } from '../../../api/schema'
import { client } from '../../../api'

export const useMyAttendance = (
  event:
    | Ref<KnoqEvent | KnoqEventDetail | undefined>
    | ComputedRef<KnoqEvent | KnoqEventDetail | undefined>
) => {
  const { PUT } = client
  /* 
    出席予定を設定可能か
    条件はイベント開始時刻より前かつ
    (メンバーである または 外部の参加可能)
    */
  const amGroupMember = computed(() => {
    if (!event.value) return

    const { data: me } = useApiSWRV('/users/me', {})
    if (!me.value) {
      return false
    }
    if ('groupId' in event.value) {
      const { data: group } = useApiSWRV('/groups/{groupID}', {
        params: { path: { groupID: event.value.groupId } }
      })
      return group.value?.members.includes(me.value.userId) ?? false
    } else {
      return event.value.group.members.includes(me.value.userId) ?? false
    }
  })
  const { data: now } = useSWRV(
    'now',
    () => {
      return new Date()
    },
    { refreshInterval: 1000 }
  )
  const beforeEnd = computed(
    () => event.value && now.value && now.value < new Date(event.value.timeEnd)
  )
  const canChange = computed(() => {
    if (!event.value) return
    return beforeEnd.value && (event.value.open || amGroupMember.value)
  })
  const mySchedule = computed(() => {
    const { data: me } = useApiSWRV('/users/me', {})
    const mySchedule = event.value?.attendees.filter((v) => v.userId === me.value?.userId)
    if (!mySchedule) {
      return
    }
    if (mySchedule.length === 0) {
      return null
    }
    return mySchedule[0].schedule
  })
  const updateMyAttendance = async (newState: Schedule) => {
    if (!event.value) return
    await PUT('/events/{eventID}/attendees/me', {
      params: { path: { eventID: event.value.eventId } },
      body: { schedule: newState }
    })
  }
  return {
    canChange,
    mySchedule,
    updateMyAttendance
  }
}
