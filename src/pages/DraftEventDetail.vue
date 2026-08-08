<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import SlotGrid from '/@/features/draft-event/components/SlotGrid.vue'
import DraftEventStatusBadge from '/@/features/draft-event/components/DraftEventStatusBadge.vue'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import { useAvailability } from '/@/features/draft-event/composables/useAvailability'
import { useSchedulingResults } from '/@/features/draft-event/composables/useSchedulingResults'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useMe } from '/@/features/user/composables/useMe'

const route = useRoute()
const { currentDraftEvent, getDraftEvent, isLoading } = useDraftEvents()
const { myAvailability, getMyAvailability, saveAvailability, isSaving } =
  useAvailability()
const { schedulingResults, getSchedulingResults } = useSchedulingResults()
const { getUsersByIds } = useUsers()
const { me } = useMe()

const draftEventId = route.params.id as string

const selectedSlotIds = ref<string[]>([])
const comment = ref('')
const statusMessage = ref('')
const isError = ref(false)

const refreshAll = async () => {
  const tasks: Promise<unknown>[] = [
    getDraftEvent(draftEventId),
    getSchedulingResults(draftEventId)
  ]
  if (me.value?.userId) {
    tasks.push(getMyAvailability(draftEventId, me.value.userId))
  }
  await Promise.all(tasks)
  if (myAvailability.value) {
    selectedSlotIds.value = [...myAvailability.value.slotIds]
    comment.value = myAvailability.value.comment ?? ''
  }
}

onMounted(refreshAll)

const displayStatus = computed(() => {
  if (!currentDraftEvent.value) return 'unanswered' as const
  if (currentDraftEvent.value.status === 'confirmed')
    return 'confirmed' as const
  return myAvailability.value ? ('answered' as const) : ('unanswered' as const)
})

const isOpen = computed(() => currentDraftEvent.value?.status === 'open')

const isAdmin = computed(() => {
  if (!currentDraftEvent.value || !me.value?.userId) return false
  return currentDraftEvent.value.admins.includes(me.value.userId)
})

const canVote = computed(() => {
  if (!currentDraftEvent.value || !me.value?.userId) return false
  if (!isOpen.value) return false
  return (
    currentDraftEvent.value.open ||
    currentDraftEvent.value.invitees.includes(me.value.userId) ||
    currentDraftEvent.value.admins.includes(me.value.userId)
  )
})

const hasChanges = computed(() => {
  if (!myAvailability.value) {
    return selectedSlotIds.value.length > 0 || comment.value !== ''
  }
  const prevSlotIds = myAvailability.value.slotIds
  const prevComment = myAvailability.value.comment ?? ''
  return (
    selectedSlotIds.value.length !== prevSlotIds.length ||
    !selectedSlotIds.value.every((id) => prevSlotIds.includes(id)) ||
    comment.value !== prevComment
  )
})

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

const onSubmit = async () => {
  if (!me.value?.userId) return

  statusMessage.value = '保存中...'
  isError.value = false

  try {
    await saveAvailability(
      draftEventId,
      me.value.userId,
      selectedSlotIds.value,
      comment.value || null
    )
    await getSchedulingResults(draftEventId)
    statusMessage.value = '回答を保存しました'
  } catch {
    statusMessage.value = '保存に失敗しました'
    isError.value = true
  }
}
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
    <div v-else class="grid gap-6">
      <div class="flex items-center justify-between">
        <h2 h2>{{ currentDraftEvent.name }}</h2>
        <div class="flex items-center gap-3">
          <RouterLink
            v-if="isAdmin"
            :to="{ name: 'DraftEventManage', params: { id: draftEventId } }"
            class="text-sm text-surface-accent-primary hover:underline"
          >
            管理画面へ
          </RouterLink>
          <DraftEventStatusBadge :status="displayStatus" />
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
        <h3 h3>参加可能な時間</h3>

        <div v-if="!canVote" class="text-sm text-text-secondary">
          <template v-if="!isOpen">
            締切を過ぎたため、回答できません。
          </template>
          <template v-else> この日程調整に回答する権限がありません。 </template>
        </div>
        <p v-else class="text-sm text-text-secondary">
          クリック or
          ドラッグで選択してください。セル内のアイコンは他の回答者です。
        </p>

        <SlotGrid
          v-model="selectedSlotIds"
          :slots="currentDraftEvent.candidateSlots"
          :results="schedulingResults?.results ?? []"
          :get-user-name="getUserName"
          :disabled="!canVote"
        />

        <template v-if="canVote">
          <div class="grid gap-2">
            <TextareaField
              id="comment"
              v-model="comment"
              label="コメント"
              placeholder="捕捉事項を入力してください"
              rows="2"
            />
            <p class="text-xs text-text-secondary">
              {{ comment.length }}/500文字
            </p>
          </div>

          <div class="flex items-center gap-4">
            <PrimaryButton
              :disabled="isSaving || !hasChanges"
              @click="onSubmit"
            >
              {{ myAvailability ? '回答を更新' : '回答を送信' }}
            </PrimaryButton>
            <!-- TODO: トーストメッセージみたいなものを実装したい -->
            <span
              v-if="statusMessage"
              :class="isError ? 'text-status-error' : 'text-status-success'"
              class="text-sm font-bold"
            >
              {{ statusMessage }}
            </span>
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
