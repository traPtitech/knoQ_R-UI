<script setup lang="ts">
import { ComputedRef, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchEvent } from '../features/event/api'
import { useMySchedule } from '../features/event/composables/useMySchedule'
import { useMe } from '/@/features/user/composables/useMe'
import { Schedule } from '/@/features/event/types'
import AppHeader from '/@/components/AppHeader.vue'
import AttendingEventList from '../features/event/components/AttendingEventList.vue'
import IconWithName from '../features/user/components/IconWithName.vue'
import AttendanceButton from '../features/event/components/AttendanceButton.vue'
import SchedulePoll from '../features/event/components/SchedulePoll.vue'
import InvitationLinkButton from '../features/event/components/InvitationLinkButton.vue'
import DescriptionMd from '../features/event/components/DescriptionMd.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'

const route = useRoute()
const router = useRouter()
const eventId: ComputedRef<string> = computed(() => route.params.id as string)

const { event, error, mutate, state } = fetchEvent(eventId.value)
const { me } = useMe()
const { canUpdate, mySchedule, updateMySchedule } = useMySchedule(me, event)

const onUpdateMySchedule = async (schedule: Schedule) => {
  await updateMySchedule(schedule)
  mutate()
}

const onDelete = async () => {
  //await deleteEvent(eventId.value)
  router.push('/')
}
</script>

<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-4>
    <div v-if="error">failed to fetch</div>
    <div v-else-if="!event">loading</div>
    <div v-else>
      <h2 hl>{{ event.name }}</h2>
      <div class="flex gap-2 items-center my-4">
        <p>by</p>
        <IconWithName :user-id="event.admins[0]" />
      </div>
      <div card grid gap-6>
        <h3 hm>日程調整</h3>
        <SchedulePoll :event="event" @update:my-schedule="onUpdateMySchedule" />
        <div class="flex gap-4">
          <AttendanceButton
            :schedule="mySchedule"
            @update:schedule="onUpdateMySchedule"
          />
          <InvitationLinkButton :event-id="eventId" />
        </div>
      </div>
      <div card grid gap-6>
        <h3 hm>イベント概要</h3>
        <DescriptionMd :markdown="event.description" />
      </div>
      <div v-if="canUpdate" card grid gap-6>
        <h3 hm>イベントの管理</h3>
        <PrimaryButton @click="onDelete">イベントを削除</PrimaryButton>
      </div>
    </div>
  </div>
</template>
