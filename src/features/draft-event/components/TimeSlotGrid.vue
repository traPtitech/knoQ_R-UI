<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ResponseCandidateSlot } from '../types'

const props = defineProps<{
  slots: ResponseCandidateSlot[]
  disabled?: boolean
}>()

const selectedSlotIds = defineModel<string[]>({ default: () => [] })

const groupedSlots = computed(() => {
  const sorted = props.slots.toSorted((a, b) =>
    a.timeStart.localeCompare(b.timeStart)
  )
  return Map.groupBy(sorted, (slot) => slot.timeStart.split('T')[0])
})

const dates = computed(() => {
  return Array.from(groupedSlots.value.keys()).sort()
})

// 時間幅は全ての日付で共通である
const timeSlots = computed(() => {
  const firstDate = dates.value[0]
  if (!firstDate) return []
  const slots = groupedSlots.value.get(firstDate) || []
  return slots.map((s) => {
    const time = s.timeStart.split('T')[1].substring(0, 5)
    return time
  })
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  })
}

const getSlot = (date: string, time: string) => {
  const slots = groupedSlots.value.get(date) || []
  return slots.find((s) => s.timeStart.split('T')[1].substring(0, 5) === time)
}

const isSelected = (slotId: string) => {
  return selectedSlotIds.value.includes(slotId)
}

const isDragging = ref(false)
const dragMode = ref<'select' | 'deselect'>('select')

const onDragStart = (slotId: string) => {
  if (props.disabled) return
  isDragging.value = true
  const wasSelected = isSelected(slotId)
  dragMode.value = wasSelected ? 'deselect' : 'select'

  selectedSlotIds.value = wasSelected
    ? selectedSlotIds.value.filter((id) => id !== slotId)
    : [...selectedSlotIds.value, slotId]
}

const onDragEnter = (slotId: string) => {
  if (!isDragging.value || props.disabled) return
  if (dragMode.value === 'select' && isSelected(slotId)) return

  selectedSlotIds.value =
    dragMode.value === 'select'
      ? [...selectedSlotIds.value, slotId]
      : selectedSlotIds.value.filter((id) => id !== slotId)
}

const onDragEnd = () => {
  isDragging.value = false
}

const selectAll = () => {
  selectedSlotIds.value = props.slots.map((s) => s.slotId)
}

const clearAll = () => {
  selectedSlotIds.value = []
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center justify-end gap-2">
      <button
        type="button"
        class="border border-border-secondary rounded px-3 py-1 text-sm transition-colors hover:bg-surface-secondary"
        :disabled="disabled"
        @click="selectAll"
      >
        全て選択
      </button>
      <button
        type="button"
        class="border border-border-secondary rounded px-3 py-1 text-sm transition-colors hover:bg-surface-secondary"
        :disabled="disabled"
        @click="clearAll"
      >
        全て解除
      </button>
    </div>

    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- ドラッグ選択のためのイベントハンドラ -->
    <div
      class="overflow-x-auto"
      @mouseup="onDragEnd"
      @mouseleave="onDragEnd"
      @focusout="onDragEnd"
    >
      <table
        class="w-full select-none border border-border-secondary"
        style="border-collapse: collapse"
      >
        <thead>
          <tr>
            <th
              class="w-14 border border-border-secondary bg-surface-secondary p-2 text-sm"
            />
            <th
              v-for="date in dates"
              :key="date"
              class="min-w-16 border border-border-secondary bg-surface-secondary p-2 text-center text-sm"
            >
              {{ formatDate(date) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(time, rowIndex) in timeSlots" :key="time">
            <td
              class="border border-border-secondary bg-surface-secondary p-2 text-center text-sm"
            >
              {{ time }}
            </td>
            <td
              v-for="(date, colIndex) in dates"
              :key="`${date}-${time}`"
              class="p-0"
              :class="[
                colIndex < dates.length - 1
                  ? 'border-r border-dashed border-border-secondary'
                  : '',
                rowIndex < timeSlots.length - 1
                  ? 'border-b border-dashed border-border-secondary'
                  : ''
              ]"
            >
              <button
                v-if="getSlot(date, time)"
                type="button"
                class="block h-10 w-full transition-colors"
                :class="{
                  'bg-surface-accent-primary': isSelected(
                    getSlot(date, time)!.slotId
                  ),
                  'bg-surface-primary hover:bg-surface-accent-primary/20':
                    !isSelected(getSlot(date, time)!.slotId),
                  'cursor-not-allowed opacity-50': disabled
                }"
                :disabled="disabled"
                @mousedown.prevent="onDragStart(getSlot(date, time)!.slotId)"
                @mouseenter="onDragEnter(getSlot(date, time)!.slotId)"
                @focusin="onDragEnter(getSlot(date, time)!.slotId)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center gap-4 text-sm text-text-secondary">
      <div class="flex items-center gap-2">
        <span class="h-4 w-4 rounded bg-surface-accent-primary" />
        <span>参加可能</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="h-4 w-4 border border-border-secondary rounded bg-surface-primary"
        />
        <span>参加不可</span>
      </div>
    </div>
  </div>
</template>
