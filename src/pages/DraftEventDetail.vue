<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import TimeSlotGrid from '/@/features/draft-event/components/TimeSlotGrid.vue'
import DraftEventStatusBadge from '/@/features/draft-event/components/DraftEventStatusBadge.vue'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import { useAvailability } from '/@/features/draft-event/composables/useAvailability'
import { useMe } from '/@/features/user/composables/useMe'

const route = useRoute()
const { currentDraftEvent, getDraftEvent, isLoading } = useDraftEvents()
const { myAvailability, getMyAvailability, saveAvailability, isSaving } =
  useAvailability()
const { me } = useMe()

const draftEventId = route.params.id as string

const selectedSlotIds = ref<string[]>([])
const comment = ref('')
const statusMessage = ref('')
const isError = ref(false)

onMounted(async () => {
  await getDraftEvent(draftEventId)
  if (!me.value?.userId) return
  await getMyAvailability(draftEventId, me.value.userId)
  if (myAvailability.value) {
    selectedSlotIds.value = [...myAvailability.value.slotIds]
    comment.value = myAvailability.value.comment ?? ''
  }
})

const displayStatus = computed(() => {
  if (!currentDraftEvent.value) return 'unanswered' as const
  if (currentDraftEvent.value.status === 'confirmed')
    return 'confirmed' as const
  return myAvailability.value ? ('answered' as const) : ('unanswered' as const)
})

const isOpen = computed(() => currentDraftEvent.value?.status === 'open')

const canVote = computed(() => {
  if (!currentDraftEvent.value || !me.value?.userId) return false
  if (!isOpen.value) return false
  // inviteesまたはadminsに含まれている または open eventである
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
        <DraftEventStatusBadge :status="displayStatus" />
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
        <h3 h3>参加可能な時間を選択</h3>

        <div v-if="!canVote" class="text-sm text-text-secondary">
          <template v-if="!isOpen">
            締切を過ぎたため、回答できません。
          </template>
          <template v-else> この日程調整に回答する権限がありません。 </template>
        </div>

        <template v-else>
          <p class="text-sm text-text-secondary">
            参加可能な時間帯をクリックまたはドラッグして選択してください
          </p>

          <TimeSlotGrid
            v-model="selectedSlotIds"
            :slots="currentDraftEvent.candidateSlots"
            :disabled="!canVote"
          />

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
    </div>
  </div>
</template>
