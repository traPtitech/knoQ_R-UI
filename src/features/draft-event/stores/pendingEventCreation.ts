import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface PendingEventCreation {
  draftEventId: string
  timeStart: string
  timeEnd: string
}

export const usePendingEventCreationStore = defineStore(
  'pendingEventCreation',
  () => {
    const pending = ref<PendingEventCreation | null>(null)

    const set = (value: PendingEventCreation) => {
      pending.value = value
    }

    const clear = () => {
      pending.value = null
    }

    return { pending, set, clear }
  }
)
