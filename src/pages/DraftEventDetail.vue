<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'

const route = useRoute()
const { currentDraftEvent, getDraftEvent, isLoading } = useDraftEvents()

const draftEventId = route.params.id as string

onMounted(async () => {
  await getDraftEvent(draftEventId)
})

const formatSlot = (timeStart: string, timeEnd: string) => {
  const start = new Date(timeStart)
  const end = new Date(timeEnd)
  const date = start.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  })
  const startTime = start.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const endTime = end.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${date} ${startTime} - ${endTime}`
}
</script>

<template>
  <AppHeader />
  <div class="mx-auto my-8 max-w-3xl p-4">
    <div v-if="isLoading" class="text-center text-text-secondary">
      読み込み中...
    </div>
    <div v-else-if="!currentDraftEvent" class="text-center text-text-secondary">
      draftイベントが見つかりません
    </div>
    <div v-else class="grid gap-6">
      <div class="flex items-center justify-between">
        <h2 h2>{{ currentDraftEvent.name }}</h2>
        <span
          class="rounded-full px-3 py-1 text-sm"
          :class="{
            'bg-green-100 text-green-700': currentDraftEvent.status === 'open',
            'bg-yellow-100 text-yellow-700':
              currentDraftEvent.status === 'closed',
            'bg-blue-100 text-blue-700':
              currentDraftEvent.status === 'confirmed'
          }"
        >
          {{
            currentDraftEvent.status === 'open'
              ? '回答受付中'
              : currentDraftEvent.status === 'closed'
                ? '締切済み'
                : '確定済み'
          }}
        </span>
      </div>

      <div grid gap-4 card>
        <h3 h3>基本情報</h3>
        <div class="grid gap-2 text-sm">
          <p v-if="currentDraftEvent.description">
            {{ currentDraftEvent.description }}
          </p>
          <p>
            <span class="text-text-secondary">締切:</span>
            {{
              new Date(currentDraftEvent.deadline).toLocaleDateString('ja-JP')
            }}
          </p>
        </div>
      </div>

      <div grid gap-4 card>
        <h3 h3>候補日時</h3>
        <p class="text-sm text-text-secondary">投票機能は今後実装予定です</p>
        <div class="grid gap-2">
          <div
            v-for="slot in currentDraftEvent.candidateSlots"
            :key="slot.slotId"
            class="rounded bg-surface-secondary p-2 text-sm"
          >
            {{ formatSlot(slot.timeStart, slot.timeEnd) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
