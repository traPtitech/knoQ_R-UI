<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { compareAsc, compareDesc, parseISO } from 'date-fns'
import AppHeader from '/@/components/AppHeader.vue'
import DraftEventCard from '/@/features/draft-event/components/DraftEventCard.vue'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import { useMe } from '/@/features/user/composables/useMe'
import type { ResponseDraftEvent } from '/@/features/draft-event/types'

const { draftEvents, isLoading, error, getDraftEvents } = useDraftEvents()
const { me } = useMe()

type FilterTab = 'all' | 'invited' | 'public'
const activeTab = ref<FilterTab>('all')

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'invited', label: '招待されたもの' },
  { key: 'public', label: '公開' }
]

type SortKey = 'deadline-asc' | 'deadline-desc' | 'created-desc' | 'status'
const activeSort = ref<SortKey>('deadline-asc')

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'deadline-asc', label: '締切が近い順' },
  { key: 'deadline-desc', label: '締切が遠い順' },
  { key: 'created-desc', label: '作成日が新しい順' },
  { key: 'status', label: 'ステータス順' }
]

const statusOrder: Record<string, number> = {
  open: 0,
  closed: 1,
  confirmed: 2
}

const sortEvents = (events: ResponseDraftEvent[]): ResponseDraftEvent[] => {
  return [...events].sort((a, b) => {
    switch (activeSort.value) {
      case 'deadline-asc':
        return compareAsc(parseISO(a.deadline), parseISO(b.deadline))
      case 'deadline-desc':
        return compareDesc(parseISO(a.deadline), parseISO(b.deadline))
      case 'created-desc':
        return compareDesc(parseISO(a.createdAt), parseISO(b.createdAt))
      case 'status':
        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
    }
  })
}

onMounted(() => {
  getDraftEvents()
})

const visibleEvents = computed(() => {
  const userId = me.value?.userId
  if (!userId) return []
  return draftEvents.value.filter(
    (e) => e.open || e.invitees.includes(userId) || e.admins.includes(userId)
  )
})

const filteredEvents = computed(() => {
  const userId = me.value?.userId
  if (!userId) return []
  let events: ResponseDraftEvent[]
  switch (activeTab.value) {
    case 'invited':
      events = visibleEvents.value.filter(
        (e) => e.invitees.includes(userId) || e.admins.includes(userId)
      )
      break
    case 'public':
      events = visibleEvents.value.filter((e) => e.open)
      break
    default:
      events = visibleEvents.value
  }
  return sortEvents(events)
})
</script>

<template>
  <AppHeader />
  <div grid mx-auto my-8 max-w-3xl gap-4 p-4>
    <div flex items-center justify-between>
      <h1 h1>日程調整</h1>
      <RouterLink btn-primary to="/draft-events/new">新規作成</RouterLink>
    </div>

    <div flex flex-wrap items-center justify-between gap-2>
      <div flex gap-2>
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="border rounded-lg px-4 py-2 text-sm font-medium transition-all"
          :class="
            activeTab === tab.key
              ? 'border-surface-accent-primary bg-surface-accent-primary/10 text-surface-accent-primary'
              : 'border-border-secondary bg-surface-primary text-text-secondary hover:bg-surface-secondary'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <label for="sort-select">
        <span class="absolute h-0 w-0 overflow-hidden">並び替え</span>
        <select
          id="sort-select"
          v-model="activeSort"
          class="border border-border-secondary rounded-lg bg-surface-primary px-3 py-2 text-sm text-text-secondary"
        >
          <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="isLoading" class="grid animate-pulse gap-4">
      <div class="h-32 rd-xl bg-surface-secondary" />
    </div>

    <div v-else-if="error" class="py-8 text-center text-text-secondary">
      {{ error }}
    </div>

    <div
      v-else-if="filteredEvents.length === 0"
      class="py-8 text-center text-text-secondary"
    >
      日程調整がありません
    </div>

    <div v-else class="grid gap-4">
      <DraftEventCard
        v-for="event in filteredEvents"
        :key="event.draftEventId"
        :event="event"
      />
    </div>
  </div>
</template>
