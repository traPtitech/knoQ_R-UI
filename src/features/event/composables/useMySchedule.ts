import { ComputedRef, Ref, computed } from 'vue'
import { KnoqEvent, KnoqEventDetail, Schedule } from '/@/features/event/types'
import { apiClient } from '/@/lib/api'
import { User } from '/@/features/user/types'
import { Group } from '/@/features/group/types'

export const useMySchedule = (
  me: Ref<User | undefined>,
  event:
    | Ref<KnoqEvent | KnoqEventDetail | undefined>
    | ComputedRef<KnoqEvent | KnoqEventDetail | undefined>,
  group?: Ref<Group | undefined>
) => {
  const mySchedule = computed(() => {
    const mySchedule = event.value?.attendees.filter(
      (v) => v.userId === me.value?.userId
    )
    if (!mySchedule || mySchedule.length === 0) {
      return
    }
    return mySchedule[0].schedule
  })

  /* 
    出席予定を設定可能か
    条件はイベント開始時刻より前かつ
    (メンバーである または 外部の参加可能)
    */
  const canUpdate = computed(() => {
    const now = new Date()
    const beforeEnd = event.value && now < new Date(event.value.timeEnd)
    if (!beforeEnd) return false

    if (!event.value || !me.value) return

    if (event.value.open) return true
    if ('groupId' in event.value) {
      const members = group?.value?.members
      return members?.includes(me.value.userId)
    } else {
      return event.value.group?.members.includes(me.value.userId)
    }
  })

  const updateMySchedule = async (schedule: Schedule) => {
    if (!event.value) return
    await apiClient.PUT('/events/{eventID}/attendees/me', {
      params: { path: { eventID: event.value.eventId } },
      body: { schedule }
    })
  }
  return {
    mySchedule,
    canUpdate,
    updateMySchedule
  }
}
