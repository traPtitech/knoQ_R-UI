<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import CheckboxField from '/@/components/UI/Form/CheckboxField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import SelectMenu from '/@/components/UI/SelectMenu.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import AlertBox from '/@/components/UI/AlertBox.vue'
import { apiClient } from '/@/lib/api'
import { useGroups } from '/@/features/group/composables/useGroups'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useMe } from '/@/features/user/composables/useMe'
import { useDraftEvents } from '/@/features/draft-event/composables/useDraftEvents'
import { usePendingEventCreationStore } from '/@/features/draft-event/stores/pendingEventCreation'
import type { components } from '/@/lib/api/schema'

type Room = components['schemas']['ResponseRoom']

const router = useRouter()
const { groups, getGroups, groupSelectItems } = useGroups()
const { users, getUserSelectItems } = useUsers()
const { me } = useMe()
const {
  currentDraftEvent,
  getDraftEvent,
  confirmDraftEvent,
  error: draftError
} = useDraftEvents()
const pendingEventCreationStore = usePendingEventCreationStore()

const pendingDraftEventId = ref<string | null>(null)
const pendingTimeStart = ref<string | null>(null)
const pendingTimeEnd = ref<string | null>(null)
const fromDraftEventName = ref<string>('')

const rooms = ref<Room[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const createdEventId = ref<string | null>(null)
const statusMessage = ref('')
const isError = ref(false)
const errors = ref<Record<string, string>>({})
const formElement = ref<HTMLFormElement | null>(null)

const form = ref({
  name: '',
  description: '',
  groupId: '',
  place: '',
  roomId: '' as string | undefined,
  timeStart: '',
  timeEnd: '',
  sharedRoom: false,
  open: true,
  admins: [] as string[]
})

const prefillFromDraft = async () => {
  if (!pendingDraftEventId.value) return
  await getDraftEvent(pendingDraftEventId.value)
  const draft = currentDraftEvent.value
  if (!draft) throw new Error('日程調整の取得に失敗しました')
  fromDraftEventName.value = draft.name
  form.value.name = draft.name
  form.value.description = draft.description ?? ''
  form.value.open = draft.open
  form.value.admins = [...draft.admins]
  if (pendingTimeStart.value) {
    form.value.timeStart = pendingTimeStart.value
  }
  if (pendingTimeEnd.value) {
    form.value.timeEnd = pendingTimeEnd.value
  }
}

onMounted(async () => {
  const pending = pendingEventCreationStore.pending
  if (pending) {
    pendingDraftEventId.value = pending.draftEventId
    pendingTimeStart.value = pending.timeStart
    pendingTimeEnd.value = pending.timeEnd
    pendingEventCreationStore.clear()
  }

  try {
    const [, res] = await Promise.all([getGroups(), apiClient.GET('/rooms')])
    if (res.data) {
      rooms.value = res.data
    }
    await prefillFromDraft()
  } catch (e) {
    console.error(e)
    statusMessage.value = 'データの読み込みに失敗しました'
    isError.value = true
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  pendingEventCreationStore.clear()
})

const roomItems = computed(() =>
  rooms.value.map((r) => ({ id: r.roomId, name: r.place }))
)

const selectedGroupName = computed(
  () => groups.value.find((g) => g.groupId === form.value.groupId)?.name
)

const adminItems = getUserSelectItems(
  computed(() => {
    const ids = [...form.value.admins]
    if (me.value?.userId) ids.push(me.value.userId)
    return ids
  })
)

const selectGroup = (item: { id: string; name: string }) => {
  form.value.groupId = item.id
  if (errors.value.groupId) delete errors.value.groupId
}

const selectRoom = (item: { id: string; name: string }) => {
  form.value.roomId = item.id
  form.value.place = item.name
}

const addAdmin = (item: { id: string; name: string }) => {
  if (!form.value.admins.includes(item.id)) {
    form.value.admins.push(item.id)
  }
}

const removeAdmin = (userId: string) => {
  form.value.admins = form.value.admins.filter((id) => id !== userId)
}

watch(
  () => form.value.place,
  (newVal) => {
    if (!form.value.roomId) return
    const room = rooms.value.find((r) => r.roomId === form.value.roomId)
    if (room && room.place !== newVal) {
      form.value.roomId = undefined
    }
  }
)

const validate = () => {
  errors.value = {}
  let isValid = true
  if (!form.value.name) {
    errors.value.name = 'イベント名を入力してください'
    isValid = false
  }
  if (!form.value.groupId) {
    errors.value.groupId = '主催グループを選択してください'
    isValid = false
  }
  if (!form.value.timeStart) {
    errors.value.timeStart = '開始日時を入力してください'
    isValid = false
  }
  if (!form.value.timeEnd) {
    errors.value.timeEnd = '終了日時を入力してください'
    isValid = false
  }
  if (
    form.value.timeStart &&
    form.value.timeEnd &&
    new Date(form.value.timeStart) >= new Date(form.value.timeEnd)
  ) {
    errors.value.timeEnd = '終了日時は開始日時より後に設定してください'
    isValid = false
  }
  return isValid
}

const onSubmit = async () => {
  if (isSubmitting.value || createdEventId.value) return
  if (!validate()) {
    statusMessage.value = '入力内容を確認してください'
    isError.value = true
    await nextTick()
    formElement.value
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus()
    return
  }

  statusMessage.value = '作成中...'
  isError.value = false

  const admins = form.value.admins.includes(me.value?.userId || '')
    ? form.value.admins
    : ([...form.value.admins, me.value?.userId].filter(Boolean) as string[])

  const commonBody = {
    name: form.value.name,
    description: form.value.description,
    groupId: form.value.groupId,
    timeStart: `${form.value.timeStart}:00+09:00`,
    timeEnd: `${form.value.timeEnd}:00+09:00`,
    sharedRoom: form.value.sharedRoom,
    open: form.value.open,
    admins: admins,
    tags: []
  }

  isSubmitting.value = true
  try {
    const body = form.value.roomId
      ? { ...commonBody, roomId: form.value.roomId }
      : { ...commonBody, place: form.value.place }
    const res = await apiClient.POST('/events', { body })
    if (!res.response.ok || !res.data)
      throw new Error('イベントの作成に失敗しました')

    createdEventId.value = res.data.eventId
    await tryConfirmFromDraft()
    statusMessage.value = '作成しました'
    router.push(`/events/${res.data.eventId}`)
  } catch (e) {
    statusMessage.value = createdEventId.value
      ? 'イベントは作成しましたが，日程調整の確定に失敗しました．日程調整は未確定のままです．'
      : 'イベントの作成に失敗しました'
    isError.value = true
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const tryConfirmFromDraft = async () => {
  if (!pendingDraftEventId.value) return
  const timeStart = `${form.value.timeStart}:00+09:00`
  const timeEnd = `${form.value.timeEnd}:00+09:00`
  await confirmDraftEvent(pendingDraftEventId.value, timeStart, timeEnd)
}
</script>

<template>
  <AppHeader />
  <main class="page-shell pb-16 pt-6 sm:pt-8">
    <nav aria-label="パンくず" class="mb-8 flex items-center gap-2 text-sm">
      <RouterLink to="/" class="link">ホーム</RouterLink>
      <span
        class="i-mdi:chevron-right text-text-secondary"
        aria-hidden="true"
      />
      <span aria-current="page">イベント作成</span>
    </nav>
    <h1 class="mb-10 h1">イベントを作成する</h1>
    <div
      v-if="isLoading"
      role="status"
      class="rounded-lg bg-surface-secondary p-8 text-text-secondary"
    >
      読み込み中...
    </div>
    <div v-else class="grid items-start gap-10 lg:grid-cols-4 lg:gap-16">
      <aside class="hidden lg:block">
        <nav
          aria-label="入力項目"
          class="border-l-2 border-border-secondary pl-5"
        >
          <a
            href="#event-basic"
            class="mb-2 min-h-11 flex items-center gap-3 text-sm link"
            ><span class="text-text-secondary">01</span>基本情報</a
          >
          <a
            href="#event-datetime"
            class="mb-2 min-h-11 flex items-center gap-3 text-sm link"
            ><span class="text-text-secondary">02</span>場所と日時</a
          >
          <a
            href="#event-admins"
            class="min-h-11 flex items-center gap-3 text-sm link"
            ><span class="text-text-secondary">03</span>管理者</a
          >
        </nav>
        <RouterLink
          to="/draft-events/new"
          class="mt-8 inline-block text-sm link"
          >日程調整を作成する</RouterLink
        >
      </aside>

      <form
        ref="formElement"
        class="min-w-0 lg:col-span-3"
        novalidate
        @submit.prevent="onSubmit"
      >
        <AlertBox
          v-if="pendingDraftEventId && fromDraftEventName"
          variant="info"
          class="mb-8"
        >
          <p>
            日程調整「<span class="font-bold">{{ fromDraftEventName }}</span
            >」から作成中です．作成すると自動的に確定済みになります．
          </p>
        </AlertBox>
        <section
          id="event-basic"
          aria-labelledby="event-basic-heading"
          class="form-section !border-t-2 !border-t-text-primary !pt-6"
        >
          <h2 id="event-basic-heading" class="mb-8 flex items-center gap-4 h2">
            <span class="text-base text-text-secondary font-normal">01</span
            >基本情報
          </h2>
          <div class="grid gap-7">
            <InputField
              id="event-name"
              v-model="form.name"
              label="イベント名"
              placeholder="例：第12回 進捗会"
              required
              :error="errors.name"
            />
            <fieldset class="grid gap-2">
              <legend class="mb-2 field-label">
                主催グループ<span class="ml-2 field-required">※必須</span>
              </legend>
              <SelectMenu
                id="event-group"
                :label="selectedGroupName || 'グループを選択してください'"
                :items="groupSelectItems"
                :invalid="!!errors.groupId"
                :described-by="errors.groupId ? 'event-group-error' : undefined"
                @select="selectGroup"
              />
              <p
                v-if="errors.groupId"
                id="event-group-error"
                class="field-error"
              >
                {{ errors.groupId }}
              </p>
            </fieldset>
            <TextareaField
              id="event-desc"
              v-model="form.description"
              label="イベント概要（任意）"
              placeholder="イベントの内容を入力"
              rows="5"
            />
            <fieldset class="grid gap-1 border-t border-border-secondary pt-5">
              <legend class="sr-only">参加と部屋の設定</legend>
              <CheckboxField
                id="event-open"
                v-model="form.open"
                label="誰でも参加可能にする"
              />
              <CheckboxField
                id="event-shared-room"
                v-model="form.sharedRoom"
                label="部屋を共有可能にする"
              />
            </fieldset>
          </div>
        </section>

        <section
          id="event-datetime"
          aria-labelledby="event-datetime-heading"
          class="form-section"
        >
          <h2
            id="event-datetime-heading"
            class="mb-8 flex items-center gap-4 h2"
          >
            <span class="text-base text-text-secondary font-normal">02</span
            >場所と日時
          </h2>
          <div class="grid gap-7">
            <div class="grid gap-3">
              <InputField
                id="event-place"
                v-model="form.place"
                label="場所"
                placeholder="例：部室，オンライン"
              />
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-sm text-text-secondary">または</span>
                <SelectMenu
                  label="部屋を選択"
                  :items="roomItems"
                  @select="selectRoom"
                />
              </div>
              <p
                v-if="form.roomId"
                class="flex items-start gap-2 text-sm text-status-success"
              >
                <span
                  class="i-mdi:check-circle mt-1 shrink-0"
                  aria-hidden="true"
                />既存の部屋「{{
                  rooms.find((r) => r.roomId === form.roomId)?.place
                }}」が選択されています
              </p>
            </div>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                id="time-start"
                v-model="form.timeStart"
                label="開始日時"
                type="datetime-local"
                required
                :error="errors.timeStart"
              />
              <InputField
                id="time-end"
                v-model="form.timeEnd"
                label="終了日時"
                type="datetime-local"
                required
                :error="errors.timeEnd"
              />
            </div>
          </div>
        </section>

        <section
          id="event-admins"
          aria-labelledby="event-admins-heading"
          class="form-section"
        >
          <h2 id="event-admins-heading" class="mb-4 flex items-center gap-4 h2">
            <span class="text-base text-text-secondary font-normal">03</span
            >管理者
          </h2>
          <div class="grid gap-4">
            <div v-if="form.admins.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="adminId in form.admins"
                :key="adminId"
                class="flex items-center gap-2 border border-border-secondary rounded-lg bg-surface-secondary pl-3"
              >
                <UserIcon :user-id="adminId" class="h-6 w-6" />
                <span class="text-sm">{{
                  users?.find((u) => u.userId === adminId)?.name || adminId
                }}</span>
                <button
                  type="button"
                  :aria-label="`${users?.find((u) => u.userId === adminId)?.name || adminId}を管理者から削除`"
                  class="h-11 w-11 flex items-center justify-center rounded-lg text-text-secondary hover:text-status-error"
                  @click="removeAdmin(adminId)"
                >
                  <span class="i-mdi:close" aria-hidden="true" />
                </button>
              </div>
            </div>
            <SelectMenu
              label="管理者を追加"
              :items="adminItems"
              class="justify-self-start"
              @select="addAdmin"
            />
          </div>
        </section>

        <div class="grid gap-5 border-t-2 border-text-primary pt-8">
          <AlertBox
            v-if="statusMessage"
            :variant="isError ? 'danger' : 'info'"
            role="status"
          >
            <p>{{ statusMessage }}</p>
            <RouterLink
              v-if="createdEventId && isError"
              :to="`/events/${createdEventId}`"
              class="mt-2 inline-block link"
              >作成したイベントを開く</RouterLink
            >
          </AlertBox>
          <div
            class="flex flex-col-reverse items-center justify-between gap-6 sm:flex-row"
          >
            <RouterLink
              to="/"
              class="min-h-12 inline-flex items-center text-sm link"
              >キャンセル</RouterLink
            >
            <PrimaryButton
              type="submit"
              :loading="isSubmitting"
              :disabled="
                isSubmitting || !!createdEventId || !me || !!draftError
              "
              class="w-full sm:min-w-60 sm:w-auto"
              >イベントを作成</PrimaryButton
            >
          </div>
        </div>
      </form>
    </div>
  </main>
</template>
