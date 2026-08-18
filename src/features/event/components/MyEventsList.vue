<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { KnoqEvent } from '/@/features/event/types.js'
import MyEvents from './MyEvents.vue'

const { myEventsData } = defineProps<{
  myEventsData: KnoqEvent[] | undefined
}>()
const upcomingEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (
    myEventsData?.filter((e) => {
      const d = new Date(e.timeStart)
      return d >= today
    }) ?? []
  )
})

// 1つのページに表示するイベントを選択
const currentPage = ref(1)
const itemsPerPage = ref(5)
const displayedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return upcomingEvents.value.slice(start, end)
})
const totalPages = computed(() =>
  Math.ceil(upcomingEvents.value.length / itemsPerPage.value)
)

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
const dateString = (date: string) => {
  const d = new Date(date)
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`
}
const IndexesOfPagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 3) {
    return [...Array(totalPages)].map((_, i) => i + 1)
  }
  switch (true) {
    case currentPage <= 1:
      return [1, 2, 3]
    case currentPage >= totalPages:
      return [totalPages - 2, totalPages - 1, totalPages]
    default:
      return [currentPage - 1, currentPage, currentPage + 1]
  }
}
</script>

<template>
  <div class="mb-8">
    <MyEvents
      v-for="event in displayedEvents"
      :key="event.eventId"
      :event-date="dateString(event.timeStart)"
      :event-name="event.name"
      :event-id="event.eventId"
    />
  </div>
  <div
    class="mx-auto w-[50%] flex gap-4 flex-justify-between flex-items-center"
  >
    <button
      class="rd-2 px-4 py-2 btn-m disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="currentPage == 1"
      @click="changePage(currentPage - 1)"
    >
      前へ
    </button>
    <div
      :class="`grid gap-4 grid-cols-${Math.min(totalPages, 3)}`"
      class="grid gap-4"
    >
      <button
        v-for="page in IndexesOfPagination(currentPage, totalPages)"
        :key="page"
        :class="page == currentPage && 'b-2 b-border-accent-primary  b-solid '"
        class="rd-2 px-4 py-2 btn-m"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </div>
    <button
      class="rd-2 px-4 py-2 btn-m disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="currentPage == totalPages"
      @click="changePage(currentPage + 1)"
    >
      次へ
    </button>
  </div>
</template>
