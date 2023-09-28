<template>
  <!-- <div v-if="loadState === 'loading'">loading</div>
  <div v-else-if="loadState === 'error'">not found</div>
  <div v-else>
    <EventName :event_name="event.name" />
    <TagList :tags="tags" />
    <EventDetailElement title="日時">
      <EventDate :time_start="event.timeStart" :time_end="event.timeEnd" />
    </EventDetailElement>
    <EventDetailElement title="場所">
      <EventPlace :place="event.place" />
    </EventDetailElement>
    <EventDetailElement title="説明">
      <EventDescription :description="event.description" />
    </EventDetailElement>
    <EventDetailElement title="グループ">
      <EventGroup :groupId="event.group.groupId" :groupName="event.group.name" />
    </EventDetailElement>
    <EventDetailElement title="管理者">
      <EventAdmins :admins="admins" />
    </EventDetailElement>
    <EventDetailElement v-if="canAttendMe()" title="自分の参加予定">
      <EventAttendanceMe :myAttendance="myAttendance" @change="onChangeMyAttendance" />
    </EventDetailElement>
    <EventDetailElement title="参加者">
      <EventAttendance v-if="attendees" :attendees="attendees" />
    </EventDetailElement> -->
  <!-- </div> -->
  <div>
    <h2>イベント</h2>
    <div v-if="error">failed to fetch</div>
    <div v-else-if="!event">loading</div>
    <div v-else>{{ event }}</div>
  </div>
  <div>
    <h3>あなたの出席</h3>
    <div v-if="canAttendance === undefined">loading</div>
    <div v-else>
      {{ canAttendance }}
    </div>
    <MyAttendance @change="updateMyAttendance" :schedule="mySchedule" />
  </div>
</template>

<script setup lang="ts">
import EventName from '../components/EventDetail/EventName.vue'
import EventDate from '../components/EventDetail/EventDate.vue'
import EventPlace from '../components/EventDetail/EventPlace.vue'
import EventDescription from '../components/EventDetail/EventDescription.vue'
import EventGroup from '../components/EventDetail/EventGroup.vue'
import EventAdmins from '../components/EventDetail/EventAdmins.vue'
import EventAttendanceMe from '../components/EventDetail/EventAttendanceMe.vue'
import EventAttendance from '../components/EventDetail/EventAttendance.vue'
import MyAttendance from '../features/event/components/MyAttendance.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import TagList from '../components/EventDetail/Tag/TagList.vue'
import { useRoute } from 'vue-router'
import { getFirstParam } from '../lib/params'
import { useUsersStore } from '../store/users'
import EventDetailElement from '../components/EventDetail/EventDetailElement.vue'
import { AttendanceState } from '../types'
import { useMeStore } from '../store/me'
import { useApiSWRV } from '../composables/useApiSWRV'
import { useMyAttendance } from '../features/event/composables/useMyAttendance'

const route = useRoute()
const eventId = computed(() => {
  return getFirstParam(route.params.id)
})

const { data: event, error } = useApiSWRV('/events/{eventID}', {
  params: { path: { eventID: eventId.value } }
})

const { canAttendance, mySchedule, updateMyAttendance } = useMyAttendance(event)

// const amGroupMember = computed(() => {
//   if (!event.value) return

//   const { data: me } = useApiSWRV('/users/me', {})
//   if (!me.value) {
//     return false
//   }

//   return event.value.group.members.includes(me.value.userId) ?? false
// })
// const canAttendance = computed(() => {
//   if (!event.value) return
//   console.log('oisu-')
//   return new Date() < new Date(event.value.timeStart) && (event.value.open || amGroupMember.value)
// })

// const {
//   event: _event,
//   loadState,
//   fetchEvent,
//   updateMyAttendance,
//   canAttendMe
// } = useEvent(eventId.value)
// const event = computed(() => _event.value!)
// const meStore = useMeStore()
// meStore.fetchMe()
// const useUsers = useUsersStore()
// useUsers.fetchUsers()

// const tags = computed((): { id: string; name: string }[] =>
//   event.value
//     ? event.value.tags.map(({ tagId, name }) => {
//         return { id: tagId, name: name }
//       })
//     : []
// )
// const admins = computed(() =>
//   event.value.admins
//     .map((userId) => useUsers.users.get(userId))
//     .filter((item) => item !== undefined)
//     .map((item) => item?.name!)
// )
// const attendees = computed(() =>
//   event.value.attendees
//     .map(({ userId, schedule }) => {
//       return {
//         name: useUsers.users.get(userId)?.name,
//         schedule
//       }
//     })
//     .filter((item) => item.name !== undefined)
//     .map(({ name, schedule }) => {
//       return { name: name!, schedule }
//     })
// )
// const myAttendance = computed(
//   () => event.value.attendees.find(({ userId }) => userId === meStore.me?.userId)?.schedule
// )
// const onChangeMyAttendance = async (newState: AttendanceState) => {
//   updateMyAttendance(newState)
// }
// onMounted(async () => {
//   await fetchEvent()
// })
</script>

<style lang="scss" module>
.section {
  @include color-ui-secondary;
  font-size: 1rem;
}
</style>
