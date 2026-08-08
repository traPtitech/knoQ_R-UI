<script setup lang="ts">
import { computed } from 'vue'
import { differenceInCalendarDays, parseISO, format } from 'date-fns'
import type { ResponseDraftEvent } from '/@/features/draft-event/types'
import DraftEventStatusBadge from './DraftEventStatusBadge.vue'
import type { DisplayStatus } from './DraftEventStatusBadge.vue'

const props = defineProps<{
  event: ResponseDraftEvent
  answered: boolean
  isInvited: boolean
}>()

const displayStatus = computed<DisplayStatus>(() => {
  if (props.event.status === 'confirmed') return 'confirmed'
  return props.answered ? 'answered' : 'unanswered'
})

const barColorClass = computed(() => {
  switch (displayStatus.value) {
    case 'unanswered':
      return 'bg-status-accepting'
    case 'answered':
      return 'bg-status-answered'
    case 'confirmed':
      return 'bg-status-confirmed'
    default:
      return 'bg-border-secondary'
  }
})

const daysLeft = computed(() =>
  differenceInCalendarDays(parseISO(props.event.deadline), new Date())
)

const deadlineFormatted = computed(() =>
  format(parseISO(props.event.deadline), 'yyyy/MM/dd')
)
</script>

<template>
  <RouterLink :to="`/draft-events/${event.draftEventId}`" block>
    <div
      flex
      items-center
      gap-3
      b-1
      b-border-secondary
      rounded-lg
      b-solid
      bg-surface-primary
      px-4
      py-3
      transition-colors
      hover:bg-surface-secondary
    >
      <div h-10 w-1 shrink-0 rounded-sm :class="barColorClass" />

      <div min-w-0 flex-1>
        <div mb-0.5 flex items-center gap-2>
          <span truncate text-sm fw-500>
            {{ event.name }}
          </span>
          <span
            v-if="isInvited"
            shrink-0
            rounded-full
            bg-tag-invited-bg
            px-2
            py-0.5
            text-xs
            text-tag-invited
            fw-500
          >
            招待
          </span>
          <span
            v-if="event.open"
            shrink-0
            rounded-full
            bg-tag-public-bg
            px-2
            py-0.5
            text-xs
            text-tag-public
            fw-500
          >
            公開
          </span>
        </div>

        <div flex items-center gap-1.5 text-xs text-text-secondary>
          <span
            fw-500
            tabular-nums
            :class="
              daysLeft <= 0
                ? 'text-status-error'
                : daysLeft <= 5
                  ? 'text-status-error'
                  : 'text-text-primary'
            "
          >
            {{ daysLeft <= 0 ? '期限切れ' : `あと${daysLeft}日` }}
          </span>
          <span text-border-secondary>&middot;</span>
          <span>{{ deadlineFormatted }}</span>
        </div>
      </div>

      <DraftEventStatusBadge :status="displayStatus" />
    </div>
  </RouterLink>
</template>
