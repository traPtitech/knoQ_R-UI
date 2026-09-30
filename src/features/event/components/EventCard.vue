<script setup lang="ts">
import type { KnoqEvent } from '/@/features/event/types'
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'

const props = defineProps<{ event: KnoqEvent }>()
const eventTime = computed(
  () =>
    `${format(parseISO(props.event.timeStart), 'HH:mm')}–${format(parseISO(props.event.timeEnd), 'HH:mm')}`
)
</script>

<template>
  <RouterLink
    :to="`/events/${event.eventId}`"
    class="group block border border-border-secondary rounded-lg bg-surface-primary p-5 hover:border-surface-accent-primary"
  >
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
      <time :datetime="event.timeStart" class="font-bold"
        >{{ format(parseISO(event.timeStart), 'M月d日')
        }}<span class="ml-3 font-normal">{{ eventTime }}</span></time
      >
      <span
        class="border border-border-secondary rounded px-2 py-0.5 text-xs text-text-secondary"
        >{{ event.open ? '参加自由' : '招待制' }}</span
      >
    </div>
    <div class="flex items-start justify-between gap-3">
      <h3
        class="text-lg text-text-link font-bold underline underline-offset-4 group-hover:decoration-2"
      >
        {{ event.name }}
      </h3>
      <span
        class="i-mdi:chevron-right mt-1 shrink-0 text-xl text-text-link"
        aria-hidden="true"
      />
    </div>
    <div
      class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary"
    >
      <span class="flex items-center gap-1.5"
        ><span
          class="i-mdi:map-marker-outline shrink-0 text-lg"
          aria-hidden="true"
        />{{ event.place || '場所未定' }}</span
      >
      <span class="flex items-center gap-1.5"
        ><span
          class="i-mdi:account-outline shrink-0 text-lg"
          aria-hidden="true"
        />{{ event.attendees.length }}人参加</span
      >
    </div>
  </RouterLink>
</template>
