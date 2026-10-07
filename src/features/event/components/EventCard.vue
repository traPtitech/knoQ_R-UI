<script setup lang="ts">
import type { KnoqEvent } from '/@/features/event/types'
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import EventAttendees from '/@/features/event/components/EventAttendees.vue'

const props = defineProps<{
  event: KnoqEvent
  hideDate?: boolean
  showDateInTime?: boolean
}>()
const start = computed(() => parseISO(props.event.timeStart))
const end = computed(() => parseISO(props.event.timeEnd))
const eventTime = computed(() => {
  if (props.showDateInTime) {
    const dateFormat =
      start.value.getFullYear() === end.value.getFullYear()
        ? 'M/d HH:mm'
        : 'yyyy/M/d HH:mm'
    return `${format(start.value, dateFormat)} – ${format(end.value, dateFormat)}`
  }
  const endFormat =
    format(start.value, 'yyyy-MM-dd') === format(end.value, 'yyyy-MM-dd')
      ? 'HH:mm'
      : 'M/d HH:mm'
  return `${format(start.value, 'HH:mm')} – ${format(end.value, endFormat)}`
})
</script>

<template>
  <RouterLink
    :to="`/events/${event.eventId}`"
    class="block min-w-0 card transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-border-accent-primary focus-visible:outline-offset-4"
  >
    <article class="min-w-0 flex gap-4 sm:gap-6">
      <div
        v-if="!hideDate"
        class="w-16 shrink-0 border-r border-border-secondary pr-4 text-center sm:w-20 sm:pr-6"
      >
        <p class="text-xs text-text-secondary">
          {{ format(start, 'yyyy/MM') }}
        </p>
        <p class="my-1 text-3xl font-medium">{{ format(start, 'dd') }}</p>
        <p class="text-sm text-text-secondary">
          {{ format(start, 'EEE', { locale: ja }) }}
        </p>
      </div>
      <div class="min-w-0 flex flex-1 flex-col">
        <h3 class="break-words text-lg font-bold">{{ event.name }}</h3>
        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <p class="flex items-center gap-2">
            <span
              class="i-mdi:clock-outline shrink-0 text-text-secondary"
              aria-hidden="true"
            />
            <span>{{ eventTime }}</span>
          </p>
          <p class="min-w-0 flex items-center gap-2">
            <span
              class="i-mdi:map-marker-outline shrink-0 text-text-secondary"
              aria-hidden="true"
            />
            <span class="break-words">{{ event.place || '場所未定' }}</span>
          </p>
        </div>
        <p
          v-if="event.description"
          class="line-clamp-2 mt-3 whitespace-pre-line break-words text-sm text-text-secondary"
        >
          {{ event.description }}
        </p>
        <div class="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <span
            v-for="tag in event.tags"
            :key="tag.tagId"
            class="max-w-full break-words rounded-full bg-surface-accent-soft px-3 py-1 text-xs"
            ># {{ tag.name }}</span
          >
          <EventAttendees
            :user-ids="event.attendees"
            class="ml-auto shrink-0"
          />
        </div>
      </div>
    </article>
  </RouterLink>
</template>
