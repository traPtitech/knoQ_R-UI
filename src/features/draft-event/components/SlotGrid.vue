<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  ResponseCandidateSlot,
  SlotResult
} from '/@/features/draft-event/types'
import UserIcon from '/@/components/UI/UserIcon.vue'

const props = withDefaults(
  defineProps<{
    slots: ResponseCandidateSlot[]
    results?: SlotResult[]
    getUserName?: (userId: string) => string
    disabled?: boolean
  }>(),
  {
    results: () => [],
    getUserName: (id: string) => id,
    disabled: false
  }
)

const selectedSlotIds = defineModel<string[]>({ default: () => [] })

const groupedSlots = computed(() => {
  const sorted = props.slots.toSorted((a, b) =>
    a.timeStart.localeCompare(b.timeStart)
  )
  return Map.groupBy(sorted, (slot) => slot.timeStart.split('T')[0])
})

const dates = computed(() => Array.from(groupedSlots.value.keys()).sort())

const timeSlots = computed(() => {
  const firstDate = dates.value[0]
  if (!firstDate) return []
  const slots = groupedSlots.value.get(firstDate) || []
  return slots.map((s) => ({
    start: s.timeStart.split('T')[1].substring(0, 5),
    end: s.timeEnd.split('T')[1].substring(0, 5)
  }))
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

const resultBySlotId = computed(() => {
  const map = new Map<string, SlotResult>()
  for (const r of props.results) map.set(r.slotId, r)
  return map
})

const maxAvailableCount = computed(() =>
  Math.max(0, ...props.results.map((r) => r.availableCount))
)

const isSelected = (slotId: string) => selectedSlotIds.value.includes(slotId)

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
  const currentlySelected = isSelected(slotId)
  if (dragMode.value === 'select' && currentlySelected) return
  if (dragMode.value === 'deselect' && !currentlySelected) return
  selectedSlotIds.value =
    dragMode.value === 'select'
      ? [...selectedSlotIds.value, slotId]
      : selectedSlotIds.value.filter((id) => id !== slotId)
}

const onDragEnd = () => {
  isDragging.value = false
}

const selectAll = () => {
  if (props.disabled) return
  selectedSlotIds.value = props.slots.map((s) => s.slotId)
}

const clearAll = () => {
  if (props.disabled) return
  selectedSlotIds.value = []
}
</script>

<template>
  <div class="grid gap-3">
    <div v-if="!disabled" class="flex items-center justify-end gap-2">
      <button
        type="button"
        class="border border-border-secondary rounded px-3 py-1 text-sm transition-colors hover:bg-surface-secondary"
        @click="selectAll"
      >
        全て選択
      </button>
      <button
        type="button"
        class="border border-border-secondary rounded px-3 py-1 text-sm transition-colors hover:bg-surface-secondary"
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
              class="min-w-24 border border-border-secondary bg-surface-secondary p-2 text-center text-sm"
            >
              {{ formatDate(date) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(time, rowIndex) in timeSlots" :key="time.start">
            <td
              class="border border-border-secondary bg-surface-secondary px-2 text-center align-middle text-xs leading-tight tabular-nums"
            >
              <div class="flex flex-col items-center gap-0.5">
                <span>{{ time.start }}</span>
                <span class="text-[10px] text-text-secondary">〜</span>
                <span>{{ time.end }}</span>
              </div>
            </td>
            <td
              v-for="(date, colIndex) in dates"
              :key="`${date}-${time.start}`"
              class="p-0 align-top"
              :class="[
                colIndex < dates.length - 1
                  ? 'border-r border-border-secondary'
                  : '',
                rowIndex < timeSlots.length - 1
                  ? 'border-b border-border-secondary'
                  : ''
              ]"
            >
              <button
                v-if="getSlot(date, time.start)"
                type="button"
                :disabled="disabled"
                :aria-pressed="isSelected(getSlot(date, time.start)!.slotId)"
                class="relative block h-full min-h-14 w-full cursor-pointer appearance-none border-0 bg-transparent p-1.5 text-left transition-colors"
                :class="[
                  isSelected(getSlot(date, time.start)!.slotId)
                    ? 'bg-surface-accent-primary/20 outline-2 outline-surface-accent-primary -outline-offset-2 outline-solid'
                    : !disabled
                      ? 'hover:bg-surface-accent-primary/5'
                      : '',
                  disabled ? 'cursor-default' : ''
                ]"
                @mousedown.prevent="
                  onDragStart(getSlot(date, time.start)!.slotId)
                "
                @mouseenter="onDragEnter(getSlot(date, time.start)!.slotId)"
                @focusin="onDragEnter(getSlot(date, time.start)!.slotId)"
              >
                <template
                  v-if="resultBySlotId.get(getSlot(date, time.start)!.slotId)"
                >
                  <span
                    v-if="
                      resultBySlotId.get(getSlot(date, time.start)!.slotId)!
                        .availableCount > 0
                    "
                    class="absolute right-1.5 top-0.5 text-xs tabular-nums"
                    :class="
                      resultBySlotId.get(getSlot(date, time.start)!.slotId)!
                        .availableCount === maxAvailableCount
                        ? 'text-text-primary fw-700'
                        : 'text-text-secondary'
                    "
                  >
                    {{
                      resultBySlotId.get(getSlot(date, time.start)!.slotId)!
                        .availableCount
                    }}
                  </span>
                  <div class="flex flex-wrap content-start gap-1 pt-4">
                    <UserIcon
                      v-for="userId in resultBySlotId.get(
                        getSlot(date, time.start)!.slotId
                      )!.availableUsers"
                      :key="userId"
                      :user-id="userId"
                      :title="getUserName(userId)"
                      class="!h-5 !w-5"
                    />
                  </div>
                </template>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!disabled"
      class="flex flex-wrap items-center gap-4 text-xs text-text-secondary"
    >
      <div class="flex items-center gap-2">
        <span
          class="h-3.5 w-3.5 rounded bg-surface-accent-primary/20 outline-2 outline-surface-accent-primary outline -outline-offset-2"
        />
        <span>自分の選択</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="h-3.5 w-3.5 border border-border-secondary rounded bg-surface-primary"
        />
        <span>未選択</span>
      </div>
    </div>
  </div>
</template>
