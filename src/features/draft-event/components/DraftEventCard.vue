<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import type { ResponseDraftEvent } from '../types'
import DraftEventStatusBadge from './DraftEventStatusBadge.vue'

const props = defineProps<{
  event: ResponseDraftEvent
}>()

const deadlineFormatted = computed(() =>
  format(parseISO(props.event.deadline), 'yyyy/MM/dd')
)

</script>

<template>
  <RouterLink :to="`/draft-events/${event.draftEventId}`">
    <div card>
      <div flex flex-col gap-3>
        <div flex items-center justify-between>
          <span text-lg font-bold>{{ event.name }}</span>
          <DraftEventStatusBadge :status="event.status" />
        </div>

        <div flex flex-col gap-1 text-sm text-text-secondary>
          <div flex items-center gap-2>
            <span i-mdi:calendar-clock class="shrink-0" />
            <span>締切: {{ deadlineFormatted }}</span>
          </div>
          <div flex items-center gap-2>
            <span i-mdi:account-group-outline class="shrink-0" />
            <span>{{ event.invitees.length }}人の招待者</span>
          </div>
          <div v-if="event.open" flex items-center gap-2>
            <span i-mdi:earth class="shrink-0" />
            <span>公開</span>
          </div>
          <div v-else flex items-center gap-2>
            <span i-mdi:lock-outline class="shrink-0" />
            <span>招待のみ</span>
          </div>
        </div>

        <p
          v-if="event.description"
          class="line-clamp-2 text-sm text-text-secondary"
        >
          {{ event.description }}
        </p>
      </div>
    </div>
  </RouterLink>
</template>
