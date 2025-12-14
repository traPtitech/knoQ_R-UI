<script setup lang="ts">
import type { KnoqEvent } from '/@/features/event/types'
import { computed } from 'vue'
import { compareAsc, format, parseISO } from 'date-fns'
import IconWithName from '/@/features/user/components/IconWithName.vue'
import { useUsers } from '../../user/composables/useUsers'

const props = defineProps<{
  event: KnoqEvent
}>()

const { getUsersByIds } = useUsers()

const attendees = getUsersByIds(props.event.attendees)

const roomName = computed(() => {
  return props.event.place || '未定'
})

const eventTime = computed(() => {
  const start = format(parseISO(props.event.timeStart), 'HH:mm')
  const end = format(parseISO(props.event.timeEnd), 'HH:mm')
  return `${start} - ${end}`
})
</script>

<template>
  <RouterLink :to="`/events/${event.eventId}`">
    <div card>
      <div flex flex-col gap-4>
        <div flex flex-col gap-2>
          <div flex flex-row justify-between>
            <span text-lg font-bold>{{ event.name }}</span>
            <span text-sm text-text-secondary>{{
              format(parseISO(event.timeStart), 'yyyy/MM/dd')
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
        <div flex flex-row flex-wrap gap-2>
          <IconWithName
            v-for="user in attendees"
            :key="user.userId"
            :user-id="user.userId"
          />
        </div>
      </div>
    </div>
  </RouterLink>
</template>
