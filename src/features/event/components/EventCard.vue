<script setup lang="ts">
import type { Event } from '/@/features/event/types'
import { computed } from 'vue'
import { compareAsc, format, parseISO } from 'date-fns'
import IconWithName from '/@/features/user/components/IconWithName.vue'

const props = defineProps<{
  event: Event
}>()

const roomName = computed(() => {
  const room = props.event.room
  if (!room) {
    return '未定'
  }
  return `${room.place} ${room.name}`
})

const eventTime = computed(() => {
  const timeRanges = props.event.timeRanges
  if (timeRanges.length === 0) {
    return '未定'
  }
  const sortedTimeRanges = timeRanges.sort((a, b) =>
    compareAsc(parseISO(a.start), parseISO(b.start))
  )
  const start = format(parseISO(sortedTimeRanges[0].start), 'HH:mm')
  const end = format(
    parseISO(sortedTimeRanges[sortedTimeRanges.length - 1].end),
    'HH:mm'
  )
  return `${start} - ${end}`
})
</script>

<template>
  <RouterLink :to="`/events/${event.eventId}`">
    <div card>
      <div flex flex-col gap-4>
        <div flex flex-col gap-2>
          <div flex flex-row justify-between>
            <span font-bold text-lg>{{ event.name }}</span>
            <span text-sm text-text-secondary>{{
              format(parseISO(event.date), 'yyyy/MM/dd')
            }}</span>
          </div>
          <div flex flex-row gap-2>
            <span i-mdi:clock-outline />
            <span>{{ eventTime }}</span>
          </div>
          <div flex flex-row gap-2>
            <span i-mdi:map-marker-outline />
            <span>{{ roomName }}</span>
          </div>
        </div>
        <div flex flex-row gap-2 flex-wrap>
          <IconWithName
            v-for="user in event.attendees"
            :key="user.userId"
            :user-id="user.userId"
            :user-name="user.userName"
          />
        </div>
      </div>
    </div>
  </RouterLink>
</template>