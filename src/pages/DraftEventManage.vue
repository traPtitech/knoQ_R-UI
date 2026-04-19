<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import SlotGrid from '/@/features/draft-event/components/SlotGrid.vue'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import { useSchedulingResults } from '/@/features/draft-event/composables/useSchedulingResults'
import { usePendingEventCreationStore } from '/@/features/draft-event/stores/pendingEventCreation'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useMe } from '/@/features/user/composables/useMe'

const route = useRoute()
const router = useRouter()
const { currentDraftEvent, getDraftEvent, isLoading } = useDraftEvents()
const { schedulingResults, getSchedulingResults } = useSchedulingResults()
const pendingEventCreationStore = usePendingEventCreationStore()
const { getUsersByIds } = useUsers()
const { me } = useMe()

const draftEventId = route.params.id as string

const timeStart = ref<string>('')
const timeEnd = ref<string>('')

const toDatetimeLocal = (iso: string) => iso.slice(0, 16)

const refreshAll = async () => {
  await Promise.all([
    getDraftEvent(draftEventId),
    getSchedulingResults(draftEventId)
  ])
  const draft = currentDraftEvent.value
  if (draft?.confirmedTimeStart && draft?.confirmedTimeEnd) {
    timeStart.value = toDatetimeLocal(draft.confirmedTimeStart)
    timeEnd.value = toDatetimeLocal(draft.confirmedTimeEnd)
  }
}

onMounted(refreshAll)

const isAdmin = computed(() => {
  if (!currentDraftEvent.value || !me.value?.userId) return false
  return currentDraftEvent.value.admins.includes(me.value.userId)
})

const isConfirmed = computed(
  () => currentDraftEvent.value?.status === 'confirmed'
)

const respondentUserIds = computed(() =>
  (schedulingResults.value?.respondents ?? []).map((r) => r.userId)
)
const nonRespondentUserIds = computed(
  () => schedulingResults.value?.nonRespondents ?? []
)
const respondentUsersRef = getUsersByIds(respondentUserIds)
const nonRespondentUsersRef = getUsersByIds(nonRespondentUserIds)

const getUserName = (userId: string) => {
  const user =
    respondentUsersRef.value?.find((u) => u.userId === userId) ??
    nonRespondentUsersRef.value?.find((u) => u.userId === userId)
  return user?.name ?? userId
}

const formatRespondedAt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const formatRange = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)
  const dateStr = s.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  })
  const timeFmt = (d: Date) =>
    d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} ${timeFmt(s)}〜${timeFmt(e)}`
}

const overlappingSlotIds = computed<string[]>(() => {
  if (!timeStart.value || !timeEnd.value) return []
  const startDate = new Date(timeStart.value)
  const endDate = new Date(timeEnd.value)
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate >= endDate
  ) {
    return []
  }
  const slots = currentDraftEvent.value?.candidateSlots ?? []
  return slots
    .filter((s) => {
      const sStart = new Date(s.timeStart)
      const sEnd = new Date(s.timeEnd)
      return sStart < endDate && sEnd > startDate
    })
    .map((s) => s.slotId)
})

const canCreate = computed(() => {
  if (!timeStart.value || !timeEnd.value) return false
  const s = new Date(timeStart.value)
  const e = new Date(timeEnd.value)
  return !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && s < e
})

const onGridSelectionChange = (slotIds: string[]) => {
  if (slotIds.length === 0) {
    timeStart.value = ''
    timeEnd.value = ''
    return
  }
  const slots = currentDraftEvent.value?.candidateSlots ?? []
  const selected = slots.filter((s) => slotIds.includes(s.slotId))
  if (selected.length === 0) return
  const earliestStart = selected.reduce(
    (min, s) => (s.timeStart < min ? s.timeStart : min),
    selected[0].timeStart
  )
  const latestEnd = selected.reduce(
    (max, s) => (s.timeEnd > max ? s.timeEnd : max),
    selected[0].timeEnd
  )
  timeStart.value = toDatetimeLocal(earliestStart)
  timeEnd.value = toDatetimeLocal(latestEnd)
}

const goToCreateEvent = () => {
  if (!canCreate.value) return
  pendingEventCreationStore.set({
    draftEventId,
    timeStart: timeStart.value,
    timeEnd: timeEnd.value
  })
  router.push({ name: 'create_event' })
}

const confirmedRangeLabel = computed(() => {
  const draft = currentDraftEvent.value
  if (!draft?.confirmedTimeStart || !draft?.confirmedTimeEnd) return null
  return formatRange(draft.confirmedTimeStart, draft.confirmedTimeEnd)
})
</script>

<template>
  <AppHeader />
  <div class="mx-auto my-8 max-w-4xl p-4">
    <div v-if="isLoading" class="text-center text-text-secondary">
      読み込み中...
    </div>
    <div v-else-if="!currentDraftEvent" class="text-center text-text-secondary">
      日程調整が見つかりません
    </div>
    <div v-else-if="!isAdmin" class="text-center text-text-secondary">
      この画面は管理者のみ閲覧できます。
    </div>
    <div v-else class="grid gap-6">
      <div class="flex items-center justify-between">
        <div class="grid gap-1">
          <p class="text-xs text-text-secondary">管理画面</p>
          <h2 h2>{{ currentDraftEvent.name }}</h2>
        </div>
        <div
          shrink-0
          b-1
          rounded-md
          b-solid
          px-2.5
          py-1
          text-xs
          fw-500
          tracking-wide
          :class="
            isConfirmed
              ? 'bg-status-confirmed/10 text-status-confirmed b-status-confirmed/20'
              : 'bg-status-accepting/10 text-status-accepting b-status-accepting/30'
          "
        >
          {{
            isConfirmed
              ? '確定済'
              : currentDraftEvent.status === 'open'
                ? '受付中'
                : '締切'
          }}
        </div>
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
          <p v-if="schedulingResults">
            <span class="text-text-secondary">回答者:</span>
            {{ schedulingResults.respondents.length }}人
            <span
              v-if="schedulingResults.nonRespondents.length > 0"
              class="text-text-secondary"
            >
              / 未回答 {{ schedulingResults.nonRespondents.length }}人
            </span>
          </p>
        </div>
      </div>

      <div grid gap-4 card>
        <h3 h3>イベント作成</h3>

        <div
          v-if="isConfirmed"
          class="flex items-start gap-2 border border-status-success/30 rounded bg-status-success/10 p-3 text-sm"
        >
          <span i-mdi:check-circle class="mt-0.5 text-status-success" />
          <div class="grid gap-1">
            <p class="font-bold">この日程調整はすでに確定済みです</p>
            <p v-if="confirmedRangeLabel" class="text-text-secondary">
              確定時刻: {{ confirmedRangeLabel }}
            </p>
          </div>
        </div>

        <p v-else class="text-sm text-text-secondary">
          投票結果表をドラッグで範囲選択すると、下の日時入力欄に自動で反映されます。時刻の微調整は入力欄で直接編集してください。作成すると日程調整は「確定済み」になります。
        </p>

        <SlotGrid
          :model-value="overlappingSlotIds"
          :slots="currentDraftEvent.candidateSlots"
          :results="schedulingResults?.results ?? []"
          :get-user-name="getUserName"
          :disabled="isConfirmed"
          @update:model-value="onGridSelectionChange"
        />

        <template v-if="!isConfirmed">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              id="manage-time-start"
              v-model="timeStart"
              label="開始日時"
              type="datetime-local"
            />
            <InputField
              id="manage-time-end"
              v-model="timeEnd"
              label="終了日時"
              type="datetime-local"
            />
          </div>

          <div class="flex items-center gap-4">
            <PrimaryButton :disabled="!canCreate" @click="goToCreateEvent">
              この時間でイベント作成
            </PrimaryButton>
          </div>
        </template>
      </div>

      <details v-if="schedulingResults" class="group" card>
        <summary
          class="flex cursor-pointer list-none items-center justify-between"
        >
          <h3 h3>回答者詳細</h3>
          <span
            class="text-sm text-text-secondary transition-transform group-open:rotate-180"
          >
            ▼
          </span>
        </summary>

        <div class="grid mt-4 gap-6">
          <div class="grid gap-3">
            <p class="text-sm font-bold">
              回答者 ({{ schedulingResults.respondents.length }}人)
            </p>
            <div
              v-if="schedulingResults.respondents.length > 0"
              class="grid gap-3"
            >
              <div
                v-for="respondent in schedulingResults.respondents"
                :key="respondent.userId"
                class="flex items-start gap-3 border-b border-border-secondary pb-3 last:border-b-0 last:pb-0"
              >
                <UserIcon :user-id="respondent.userId" />
                <div class="grid gap-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold">
                      {{ getUserName(respondent.userId) }}
                    </span>
                    <span class="text-xs text-text-secondary">
                      {{ formatRespondedAt(respondent.respondedAt) }}
                    </span>
                  </div>
                  <p
                    v-if="respondent.comment"
                    class="text-sm text-text-secondary"
                  >
                    {{ respondent.comment }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-text-secondary">
              まだ回答がありません
            </p>
          </div>

          <div
            v-if="schedulingResults.nonRespondents.length > 0"
            class="grid gap-3"
          >
            <p class="text-sm font-bold">
              未回答者 ({{ schedulingResults.nonRespondents.length }}人)
            </p>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="userId in schedulingResults.nonRespondents"
                :key="userId"
                class="flex items-center gap-2"
              >
                <UserIcon :user-id="userId" />
                <span class="text-sm">{{ getUserName(userId) }}</span>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>
