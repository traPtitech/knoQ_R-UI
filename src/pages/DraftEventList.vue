<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { compareAsc, compareDesc, parseISO } from 'date-fns'
import AppHeader from '/@/components/AppHeader.vue'
import DraftEventCard from '/@/features/draft-event/components/DraftEventCard.vue'
import DraftEventFilterDropdown from '/@/features/draft-event/components/DraftEventFilterDropdown.vue'
import DraftEventSortDropdown from '/@/features/draft-event/components/DraftEventSortDropdown.vue'
import type { SortKey } from '/@/features/draft-event/components/DraftEventSortDropdown.vue'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import { useAvailability } from '/@/features/draft-event/composables/useAvailability'
import { useMe } from '/@/features/user/composables/useMe'
import type { ResponseDraftEvent } from '/@/features/draft-event/types'

const { draftEvents, isLoading, error, getDraftEvents } = useDraftEvents()
const { allAvailabilities, getMyAllAvailabilities } = useAvailability()
const { me } = useMe()

const typeFilter = ref<string[]>([])
const statusFilter = ref<string[]>([])
const activeSort = ref<SortKey>('deadline-asc')

const answeredEventIds = computed(() => {
  const ids = new Set<string>()
  for (const a of allAvailabilities.value) {
    ids.add(a.draftEventId)
  }
  return ids
})

function getDisplayStatus(
  event: ResponseDraftEvent
): 'unanswered' | 'answered' | 'confirmed' {
  if (event.status === 'confirmed') return 'confirmed'
  return answeredEventIds.value.has(event.draftEventId)
    ? 'answered'
    : 'unanswered'
}

function isInvited(event: ResponseDraftEvent): boolean {
  const userId = me.value?.userId
  if (!userId) return false
  return event.invitees.includes(userId) || event.admins.includes(userId)
}

function isExpired(event: ResponseDraftEvent): boolean {
  return parseISO(event.deadline) < new Date()
}

const visibleEvents = computed(() => {
  const userId = me.value?.userId
  return draftEvents.value.filter((e) => {
    // 権限チェック: ログイン時は公開or招待or管理者、未ログイン時は公開のみ
    const canView = e.open || (userId && (e.invitees.includes(userId) || e.admins.includes(userId)))
    if (!canView) return false

    const status = getDisplayStatus(e)
    if (isExpired(e) && (status === 'answered' || status === 'confirmed'))
      return false

    return true
  })
})

const filteredEvents = computed(() => {
  let result = visibleEvents.value

  if (typeFilter.value.length > 0) {
    result = result.filter((e) => {
      if (typeFilter.value.includes('invited') && isInvited(e)) return true
      if (typeFilter.value.includes('public') && e.open) return true
      return false
    })
  }

  if (statusFilter.value.length > 0) {
    result = result.filter((e) =>
      statusFilter.value.includes(getDisplayStatus(e))
    )
  }

  const statusOrder: Record<string, number> = {
    unanswered: 0,
    answered: 1,
    confirmed: 2
  }

  return [...result].sort((a, b) => {
    if (activeSort.value === 'status') {
      const d =
        (statusOrder[getDisplayStatus(a)] ?? 9) -
        (statusOrder[getDisplayStatus(b)] ?? 9)
      return d !== 0 ? d : compareAsc(parseISO(a.deadline), parseISO(b.deadline))
    }
    if (activeSort.value === 'deadline-desc') {
      return compareDesc(parseISO(a.deadline), parseISO(b.deadline))
    }
    return compareAsc(parseISO(a.deadline), parseISO(b.deadline))
  })
})

onMounted(() => {
  getDraftEvents()
})

watch(
  () => me.value?.userId,
  (userId) => {
    if (userId) {
      getMyAllAvailabilities(userId)
    }
  },
  { immediate: true }
)
</script>

<template>
  <AppHeader />
  <div grid mx-auto my-8 max-w-3xl gap-4 p-4>
    <div flex items-center justify-between>
      <h1 h1>日程調整</h1>
      <RouterLink btn-primary to="/draft-events/new">新規作成</RouterLink>
    </div>

    <div flex flex-wrap items-center gap-1.5>
      <DraftEventFilterDropdown
        v-model:type-filter="typeFilter"
        v-model:status-filter="statusFilter"
      />
      <DraftEventSortDropdown v-model="activeSort" />
    </div>

    <div v-if="isLoading" grid animate-pulse gap-2>
      <div h-16 rounded-lg bg-surface-secondary />
      <div h-16 rounded-lg bg-surface-secondary />
      <div h-16 rounded-lg bg-surface-secondary />
    </div>

    <div v-else-if="error" py-8 text-center text-sm text-text-secondary>
      {{ error }}
    </div>

    <div
      v-else-if="filteredEvents.length === 0"
      py-8 text-center text-sm text-text-secondary
    >
      該当するイベントがありません
    </div>


    <div v-else grid gap-1.5>
      <DraftEventCard
        v-for="event in filteredEvents"
        :key="event.draftEventId"
        :event="event"
        :answered="answeredEventIds.has(event.draftEventId)"
        :is-invited="isInvited(event)"
      />
    </div>
  </div>
</template>
