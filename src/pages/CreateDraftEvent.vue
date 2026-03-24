<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import MultiDatePicker from '/@/components/UI/Form/MultiDatePicker.vue'
import WeekdayPicker from '/@/components/UI/Form/WeekdayPicker.vue'
import TimeSelector from '/@/components/UI/Form/TimeSelector.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import SelectMenu from '/@/components/UI/SelectMenu.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useGroups } from '/@/features/group/composables/useGroups'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useMe } from '/@/features/user/composables/useMe'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import type { RequestCandidateSlot } from '/@/features/draft-event/types'

const router = useRouter()
const { groups, getGroups, groupSelectItems } = useGroups()
const { users, getUserSelectItems } = useUsers()
const { me } = useMe()
const { createDraftEvent, isLoading: isSubmitting } = useDraftEvents()

const isLoading = ref(true)
const statusMessage = ref('')
const isError = ref(false)
const errors = ref<Record<string, string>>({})

type DateSelectionMode = 'calendar' | 'weekday'

const dateSelectionMode = ref<DateSelectionMode>('calendar')

const form = ref({
  name: '',
  description: '',
  deadline: '',
  open: true,
  admins: [] as string[],
  invitees: [] as string[],
  candidateDates: [] as string[],
  selectedWeekdays: [] as number[],
  timeStart: '',
  timeEnd: ''
})

onMounted(async () => {
  try {
    await getGroups()
    if (me.value?.userId && !form.value.admins.includes(me.value.userId)) {
      form.value.admins.push(me.value.userId)
    }
  } catch (e) {
    console.error(e)
    statusMessage.value = 'データの読み込みに失敗しました'
    isError.value = true
  } finally {
    isLoading.value = false
  }
})

const adminItems = getUserSelectItems(computed(() => form.value.admins))
const inviteeItems = getUserSelectItems(computed(() => form.value.invitees))

const addAdmin = (item: { id: string; name: string }) => {
  if (!form.value.admins.includes(item.id)) {
    form.value.admins.push(item.id)
  }
}

const removeAdmin = (userId: string) => {
  form.value.admins = form.value.admins.filter((id) => id !== userId)
}

const addInvitee = (item: { id: string; name: string }) => {
  if (!form.value.invitees.includes(item.id)) {
    form.value.invitees.push(item.id)
  }
}

const removeInvitee = (userId: string) => {
  form.value.invitees = form.value.invitees.filter((id) => id !== userId)
}

// グループのメンバーを一括追加
// TODO: knoQのグループという概念はなくしていきたいので，traQのグループを取得できないか考える
const addGroupMembers = (item: { id: string; name: string }) => {
  const members = groups.value.find((g) => g.groupId === item.id)?.members ?? []
  members
    .filter((id) => !form.value.invitees.includes(id))
    .forEach((id) => form.value.invitees.push(id))
}

// 30分単位のスロットを生成
const generateSlots = (): RequestCandidateSlot[] => {
  const slots: RequestCandidateSlot[] = []

  for (const date of form.value.candidateDates) {
    const [startHour, startMin] = form.value.timeStart.split(':').map(Number)
    const [endHour, endMin] = form.value.timeEnd.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStartStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`

      currentMin += 30
      if (currentMin >= 60) {
        currentMin = 0
        currentHour += 1
      }

      const timeEndStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`

      slots.push({
        timeStart: `${date}T${timeStartStr}:00`,
        timeEnd: `${date}T${timeEndStr}:00`
      })
    }
  }

  return slots
}

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.name) {
    errors.value.name = 'イベント名を入力してください'
    isValid = false
  }
  if (!form.value.deadline) {
    errors.value.deadline = '締切日を入力してください'
    isValid = false
  }

  if (
    dateSelectionMode.value === 'calendar' &&
    form.value.candidateDates.length === 0
  ) {
    errors.value.candidateDates = '候補日を1つ以上選択してください'
    isValid = false
  } else if (
    dateSelectionMode.value !== 'calendar' &&
    form.value.selectedWeekdays.length === 0
  ) {
    errors.value.candidateDates = '候補曜日を1つ以上選択してください'
    isValid = false
  }

  if (!form.value.timeStart || !form.value.timeEnd) {
    errors.value.timeRange = '時間枠を設定してください'
    isValid = false
  }
  if (form.value.timeStart >= form.value.timeEnd) {
    errors.value.timeRange = '終了時刻は開始時刻より後に設定してください'
    isValid = false
  }

  if (form.value.admins.length === 0) {
    errors.value.admins = '管理者を1人以上指定してください'
    isValid = false
  }

  return isValid
}

const onSubmit = async () => {
  if (!validate()) {
    statusMessage.value = '入力内容を確認してください'
    isError.value = true
    return
  }

  statusMessage.value = '作成中...'
  isError.value = false

  const candidateSlots = generateSlots()

  try {
    const result = await createDraftEvent({
      name: form.value.name,
      description: form.value.description || undefined,
      deadline: new Date(form.value.deadline).toISOString(),
      open: form.value.open,
      admins: form.value.admins,
      invitees: form.value.invitees,
      // TODO: 本番の形式とは若干異なるが，mock対応のため一旦これで
      candidateSlots: candidateSlots.map((slot) => ({
        ...slot,
        slotId: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
      })),
      tags: []
    })

    statusMessage.value = '作成しました'
    router.push(`/draft-events/${result.draftEventId}`)
  } catch (e) {
    statusMessage.value = 'エラーが発生しました'
    isError.value = true
    console.error(e)
  }
}
</script>

<template>
  <AppHeader />
  <div
    v-if="isLoading"
    class="mx-auto my-16 max-w-3xl p-4 text-center text-text-secondary"
  >
    読み込み中...
  </div>
  <div v-else class="grid mx-auto my-8 max-w-3xl gap-8 p-4">
    <h2 h2>日程調整を作成する</h2>

    <div grid gap-6 card>
      <h3 h3>基本情報</h3>
      <div grid gap-1>
        <InputField
          id="event-name"
          v-model="form.name"
          label="イベント名"
          placeholder="第n回進捗会"
          :error="!!errors.name"
        />
        <p v-if="errors.name" class="text-xs text-status-error">
          {{ errors.name }}
        </p>
      </div>

      <TextareaField
        id="event-desc"
        v-model="form.description"
        label="イベント概要"
        rows="3"
      />

      <div grid gap-1>
        <InputField
          id="deadline"
          v-model="form.deadline"
          label="締切日"
          type="date"
          :error="!!errors.deadline"
        />
        <p v-if="errors.deadline" class="text-xs text-status-error">
          {{ errors.deadline }}
        </p>
      </div>

      <label for="open-flag" class="flex cursor-pointer items-center gap-2">
        <input
          id="open-flag"
          v-model="form.open"
          type="checkbox"
          class="h-4 w-4"
        />
        <span class="text-sm">誰でも参加可能にする </span>
      </label>
    </div>

    <div grid gap-6 card>
      <h3 h3>候補日時</h3>
      <div grid gap-4>
        <h5 h5>時間枠</h5>
        <div class="flex items-center gap-4">
          <TimeSelector v-model="form.timeStart" label="開始" />
          <span class="mt-5 text-text-secondary">〜</span>
          <TimeSelector
            v-model="form.timeEnd"
            label="終了"
            :min-time="form.timeStart"
          />
        </div>
        <p v-if="errors.timeRange" class="text-xs text-status-error">
          {{ errors.timeRange }}
        </p>
      </div>

      <div grid gap-2>
        <h5 h5>候補日の指定方法</h5>
        <div class="flex gap-2">
          <!-- TODO: このボタンはコンポーネント化する？ -->
          <button
            type="button"
            class="flex-1 border rounded-lg px-4 py-2 text-sm font-medium transition-all"
            :class="
              dateSelectionMode === 'calendar'
                ? 'border-surface-accent-primary bg-surface-accent-primary/10 text-surface-accent-primary'
                : 'border-border-secondary bg-surface-primary text-text-secondary hover:bg-surface-secondary'
            "
            @click="dateSelectionMode = 'calendar'"
          >
            <span i-mdi:calendar class="mr-1 inline-block align-middle" />
            日付で選択
          </button>
          <button
            type="button"
            class="flex-1 border rounded-lg px-4 py-2 text-sm font-medium transition-all"
            :class="
              dateSelectionMode === 'weekday'
                ? 'border-surface-accent-primary bg-surface-accent-primary/10 text-surface-accent-primary'
                : 'border-border-secondary bg-surface-primary text-text-secondary hover:bg-surface-secondary'
            "
            @click="dateSelectionMode = 'weekday'"
          >
            <span i-mdi:calendar-week class="mr-1 inline-block align-middle" />
            曜日で指定
          </button>
        </div>
      </div>

      <div v-if="dateSelectionMode === 'calendar'" grid gap-1>
        <MultiDatePicker v-model="form.candidateDates" label="候補日" />
        <p v-if="errors.candidateDates" class="text-xs text-status-error">
          {{ errors.candidateDates }}
        </p>
      </div>
      <div v-else grid gap-1>
        <WeekdayPicker v-model="form.selectedWeekdays" label="候補曜日" />
        <p v-if="errors.candidateDates" class="text-xs text-status-error">
          {{ errors.candidateDates }}
        </p>
      </div>
    </div>

    <div grid gap-6 card>
      <h3 h3>管理者</h3>
      <div grid gap-4>
        <div v-if="form.admins.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="adminId in form.admins"
            :key="adminId"
            class="flex items-center gap-2 border border-border-secondary rounded-full bg-surface-secondary px-3 py-1"
          >
            <UserIcon
              :user-id="users?.find((u) => u.userId === adminId)?.name || ''"
              class="h-6 w-6"
            />
            <span class="text-sm">{{
              users?.find((u) => u.userId === adminId)?.name || ''
            }}</span>
            <button
              class="bg-transparent text-text-secondary transition-colors hover:text-status-error"
              @click="removeAdmin(adminId)"
            >
              <span i-mdi:close class="block" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <SelectMenu
            label="管理者を追加"
            :items="adminItems"
            @select="addAdmin"
          />
        </div>
        <p v-if="errors.admins" class="text-xs text-status-error">
          {{ errors.admins }}
        </p>
      </div>
    </div>

    <div grid gap-6 card>
      <h3 h3>招待者</h3>
      <div grid gap-4>
        <div v-if="form.invitees.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="inviteeId in form.invitees"
            :key="inviteeId"
            class="flex items-center gap-2 border border-border-secondary rounded-full bg-surface-secondary px-3 py-1"
          >
            <UserIcon
              :user-id="
                users?.find((u) => u.userId === inviteeId)?.name || inviteeId
              "
              class="h-6 w-6"
            />
            <span class="text-sm">{{
              users?.find((u) => u.userId === inviteeId)?.name || inviteeId
            }}</span>
            <button
              class="bg-transparent text-text-secondary transition-colors hover:text-status-error"
              @click="removeInvitee(inviteeId)"
            >
              <span i-mdi:close class="block" />
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <p
            v-if="form.invitees.length === 0"
            class="text-sm text-text-secondary"
          >
            招待者が選択されていません
          </p>
          <SelectMenu
            label="ユーザーを追加"
            :items="inviteeItems"
            @select="addInvitee"
          />
          <SelectMenu
            label="グループから追加"
            :items="groupSelectItems"
            @select="addGroupMembers"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <PrimaryButton :disabled="isSubmitting" @click="onSubmit">
        日程調整を作成
      </PrimaryButton>
      <span
        v-if="statusMessage"
        :class="isError ? 'text-status-error' : 'text-status-success'"
        class="text-sm font-bold"
      >
        {{ statusMessage }}
      </span>
    </div>
  </div>
</template>
