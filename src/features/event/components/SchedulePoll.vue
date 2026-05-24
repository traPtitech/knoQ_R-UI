<script setup lang="ts">
import { computed } from 'vue'
import SchedulePollButton from './SchedulePollButton.vue'
import IconWithName from '/@/features/user/components/IconWithName.vue'
import type {
  SchedulePollAttendee,
  SchedulePollEvent,
  SchedulePollScheduleOption,
  SchedulePollScheduleStatus
} from '/@/features/event/types'

const props = defineProps<{ event: SchedulePollEvent }>()

const schedules = computed<SchedulePollScheduleOption[]>(
  () => props.event.schedules ?? []
)
const attendees = computed<SchedulePollAttendee[]>(
  () => props.event.attendees ?? []
)

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short'
  }).format(date)
}

const getAttendeesByStatus = (
  scheduleStartAt: string,
  scheduleEndAt: string,
  status: SchedulePollScheduleStatus
) => {
  return computed(() =>
    attendees.value.filter((attendee) =>
      attendee.schedule.some(
        (s) =>
          s.startAt === scheduleStartAt &&
          s.endAt === scheduleEndAt &&
          s.status === status
      )
    )
  ).value
}
</script>

<template>
  <div grid gap-2>
    <div
      v-for="scheduleOption in schedules"
      :key="scheduleOption.startAt + scheduleOption.endAt"
      class="mb-2 border-b-2 border-gray-200 border-solid pb-2"
    >
      <div grid grid-flow-col mb-2 items-center grid-justify-between>
        <p>
          {{ formatDateTime(scheduleOption.startAt) }} -
          {{ formatDateTime(scheduleOption.endAt) }}
        </p>
        <SchedulePollButton />
      </div>
      <div class="ml-4">
        <p class="text-sm font-bold">参加</p>
        <div class="mb-1 flex flex-wrap gap-2">
          <IconWithName
            v-for="attendee in getAttendeesByStatus(
              scheduleOption.startAt,
              scheduleOption.endAt,
              'attending'
            )"
            :key="attendee.user.userId"
            :user-id="attendee.user.userId"
          />
          <span
            v-if="
              getAttendeesByStatus(
                scheduleOption.startAt,
                scheduleOption.endAt,
                'attending'
              ).length === 0
            "
            class="text-gray-500"
            >なし</span
          >
        </div>

        <p class="text-sm font-bold">不参加</p>
        <div class="mb-1 flex flex-wrap gap-2">
          <IconWithName
            v-for="attendee in getAttendeesByStatus(
              scheduleOption.startAt,
              scheduleOption.endAt,
              'absent'
            )"
            :key="attendee.user.userId"
            :user-id="attendee.user.userId"
          />
          <span
            v-if="
              getAttendeesByStatus(
                scheduleOption.startAt,
                scheduleOption.endAt,
                'absent'
              ).length === 0
            "
            class="text-gray-500"
            >なし</span
          >
        </div>

        <p class="text-sm font-bold">未回答</p>
        <div class="flex flex-wrap gap-2">
          <IconWithName
            v-for="attendee in getAttendeesByStatus(
              scheduleOption.startAt,
              scheduleOption.endAt,
              'pending'
            )"
            :key="attendee.user.userId"
            :user-id="attendee.user.userId"
          />
          <span
            v-if="
              getAttendeesByStatus(
                scheduleOption.startAt,
                scheduleOption.endAt,
                'pending'
              ).length === 0
            "
            class="text-gray-500"
            >なし</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
