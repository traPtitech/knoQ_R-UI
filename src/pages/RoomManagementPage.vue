<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppHeader from '/@/components/AppHeader.vue'
import AlertBox from '/@/components/UI/AlertBox.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import { useMe } from '/@/features/user/composables/useMe'
import type { components } from '/@/lib/api'
import { apiClient } from '/@/lib/api'
import { now, todayStart } from '/@/lib/time'

type Room = components['schemas']['ResponseRoom']
type FetchState = 'pending' | 'success' | 'error'

const { me, state: meState } = useMe()
const rooms = ref<Room[]>([])
const roomsState = ref<FetchState>('pending')
const csvContent = ref('')
const csvMessage = ref('')
const csvError = ref('')
const deleteMessage = ref('')
const deleteError = ref('')
const selectedRoomIds = ref(new Set<string>())
const isSubmittingCsv = ref(false)
const isDeleting = ref(false)
const isDeleteDialogOpen = ref(false)
let hasFetched = false

const isPrivileged = computed(() => me.value?.privileged === true)
const selectedCount = computed(() => selectedRoomIds.value.size)
const canDelete = computed(() => selectedCount.value > 0 && !isDeleting.value)
const canSubmitCsv = computed(
  () => csvContent.value.trim().length > 0 && !isSubmittingCsv.value
)
const canManageRoom = (room: Room) =>
  Boolean(me.value && room.admins.includes(me.value.userId))

const sortCurrentRooms = (roomList: Room[], referenceTime: string) =>
  roomList
    .filter(
      (room) =>
        room.verified && new Date(room.timeEnd) >= new Date(referenceTime)
    )
    .sort((left, right) => {
      const startDifference =
        new Date(left.timeStart).getTime() - new Date(right.timeStart).getTime()
      return startDifference || left.roomId.localeCompare(right.roomId)
    })

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso))

const formatRoomTime = (room: Room) =>
  `${formatDateTime(room.timeStart)}〜${formatDateTime(room.timeEnd)}`

const fetchRooms = async () => {
  roomsState.value = 'pending'
  deleteError.value = ''
  const referenceTime = now()

  try {
    const { data, error } = await apiClient.GET('/rooms', {
      params: { query: { dateBegin: todayStart() } }
    })
    if (error || !data) {
      roomsState.value = 'error'
      return
    }

    rooms.value = sortCurrentRooms(data, referenceTime)
    selectedRoomIds.value = new Set(
      [...selectedRoomIds.value].filter((roomId) =>
        rooms.value.some(
          (room) => room.roomId === roomId && canManageRoom(room)
        )
      )
    )
    roomsState.value = 'success'
  } catch {
    roomsState.value = 'error'
  }
}

watch(
  isPrivileged,
  (privileged) => {
    if (!privileged || hasFetched) return
    hasFetched = true
    void fetchRooms()
  },
  { immediate: true }
)

const toggleRoom = (roomId: string) => {
  const room = rooms.value.find((candidate) => candidate.roomId === roomId)
  if (!room || !canManageRoom(room)) return

  const next = new Set(selectedRoomIds.value)
  if (next.has(roomId)) {
    next.delete(roomId)
  } else {
    next.add(roomId)
  }
  selectedRoomIds.value = next
}

const openDeleteDialog = () => {
  if (!canDelete.value) return
  isDeleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
  if (isDeleting.value) return
  isDeleteDialogOpen.value = false
}

const deleteSelectedRooms = async () => {
  if (!canDelete.value) return

  const roomIds = [...selectedRoomIds.value].filter((roomId) =>
    rooms.value.some((room) => room.roomId === roomId && canManageRoom(room))
  )
  if (roomIds.length === 0) return

  isDeleting.value = true
  deleteMessage.value = ''
  deleteError.value = ''

  const results: { roomId: string; failed: boolean }[] = []
  for (const roomId of roomIds) {
    try {
      const { error } = await apiClient.DELETE('/rooms/{roomID}', {
        params: { path: { roomID: roomId } }
      })
      results.push({ roomId, failed: Boolean(error) })
    } catch {
      results.push({ roomId, failed: true })
    }
  }

  const failedRoomIds = new Set(
    results.filter((result) => result.failed).map((result) => result.roomId)
  )
  const deletedRoomIds = new Set(
    results.filter((result) => !result.failed).map((result) => result.roomId)
  )

  rooms.value = rooms.value.filter((room) => !deletedRoomIds.has(room.roomId))
  selectedRoomIds.value = failedRoomIds
  isDeleting.value = false
  isDeleteDialogOpen.value = false

  if (failedRoomIds.size > 0) {
    deleteError.value = `${failedRoomIds.size}件の削除に失敗しました．失敗した部屋を選択したままにしています．`
    return
  }

  deleteMessage.value = `${deletedRoomIds.size}件の進捗部屋を削除しました．`
}

const submitCsv = async () => {
  if (!canSubmitCsv.value) return

  isSubmittingCsv.value = true
  csvMessage.value = ''
  csvError.value = ''

  try {
    const { error } = await apiClient.POST('/rooms/all', {
      // 生成スキーマと実APIの差を，既存のCSV直送実装と同じ方法で吸収する．
      body: csvContent.value as never,
      headers: { 'Content-Type': 'text/csv' },
      bodySerializer: (content) => content as unknown as string
    })
    if (error) {
      csvError.value =
        '進捗部屋の登録に失敗しました．CSVの内容を確認してください．'
      return
    }

    csvContent.value = ''
    csvMessage.value = '進捗部屋を登録しました．'
    await fetchRooms()
  } catch {
    csvError.value =
      '進捗部屋の登録に失敗しました．時間をおいて再度お試しください．'
  } finally {
    isSubmittingCsv.value = false
  }
}
</script>

<template>
  <AppHeader />
  <main class="grid mx-auto max-w-5xl gap-8 p-4 pb-12">
    <div>
      <p class="mb-1 text-sm text-text-secondary">進捗部屋</p>
      <h1 hl>進捗部屋管理</h1>
    </div>

    <div
      v-if="meState === 'pending' || meState === 'validating'"
      class="py-12 text-center text-text-secondary"
      data-testid="permission-loading"
    >
      権限情報を確認しています．
    </div>

    <AlertBox
      v-else-if="!isPrivileged"
      variant="warning"
      data-testid="forbidden"
    >
      この画面は特権ユーザーだけが利用できます．
    </AlertBox>

    <template v-else>
      <section class="grid gap-6" card>
        <div>
          <h2 h3>CSVで一括登録</h2>
          <p class="mt-2 text-sm text-text-secondary">
            traPで確保した進捗部屋をCSV形式で登録します．
          </p>
        </div>

        <div class="text-text-secondary">
          <p class="mb-1 text-sm font-bold">フォーマット例</p>
          <div
            class="overflow-x-auto whitespace-pre border border-border-secondary rounded bg-surface-secondary p-4 text-sm font-mono"
          >
            Subject,Location,Start date,End date,Start time,End time<br />進捗部屋,S2-201
            (S224),2026/09/01,2026/09/01,12:25,18:55
          </div>
        </div>

        <TextareaField
          id="csv-input"
          v-model="csvContent"
          label="CSVデータ"
          placeholder="ここにCSVデータを貼り付けてください"
          rows="8"
        />

        <AlertBox v-if="csvError" variant="danger" data-testid="csv-error">
          {{ csvError }}
        </AlertBox>
        <AlertBox v-else-if="csvMessage" data-testid="csv-success">
          {{ csvMessage }}
        </AlertBox>

        <div>
          <PrimaryButton
            data-testid="submit-csv"
            :disabled="!canSubmitCsv"
            @click="submitCsv"
          >
            {{ isSubmittingCsv ? '登録中…' : 'CSVを登録' }}
          </PrimaryButton>
        </div>
      </section>

      <section class="grid gap-6" card>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 h3>予約済みの進捗部屋</h2>
            <p class="mt-2 text-sm text-text-secondary">
              進行中と今後の予約を，開始日時が早い順に表示しています．
            </p>
          </div>
          <button
            class="border border-status-error rounded px-4 py-2 text-status-error font-medium disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="open-delete-dialog"
            :disabled="!canDelete"
            @click="openDeleteDialog"
          >
            選択した{{ selectedCount }}件を削除
          </button>
        </div>

        <AlertBox
          v-if="deleteError"
          variant="danger"
          data-testid="delete-error"
        >
          {{ deleteError }}
        </AlertBox>
        <AlertBox v-else-if="deleteMessage" data-testid="delete-success">
          {{ deleteMessage }}
        </AlertBox>

        <div
          v-if="roomsState === 'pending'"
          class="grid animate-pulse gap-3"
          data-testid="rooms-loading"
        >
          <div class="h-20 rounded bg-surface-secondary" />
          <div class="h-20 rounded bg-surface-secondary" />
        </div>
        <AlertBox
          v-else-if="roomsState === 'error'"
          variant="danger"
          data-testid="rooms-error"
        >
          進捗部屋の取得に失敗しました．
          <button class="ml-2 underline" @click="fetchRooms">再読み込み</button>
        </AlertBox>
        <div
          v-else-if="rooms.length === 0"
          class="py-10 text-center text-text-secondary"
          data-testid="rooms-empty"
        >
          進行中または今後の進捗部屋はありません．
        </div>
        <ul v-else class="grid gap-3">
          <li
            v-for="room in rooms"
            :key="room.roomId"
            class="flex items-center gap-4 border border-border-secondary rounded p-4"
            data-testid="room-row"
          >
            <div class="min-w-0 flex flex-1 items-center gap-4">
              <input
                :id="`room-${room.roomId}`"
                type="checkbox"
                class="h-5 w-5 shrink-0 accent-surface-accent-primary"
                :checked="selectedRoomIds.has(room.roomId)"
                :data-testid="`room-checkbox-${room.roomId}`"
                :disabled="isDeleting || !canManageRoom(room)"
                :aria-label="`${room.place}を削除対象に選択`"
                @change="toggleRoom(room.roomId)"
              />
              <span class="min-w-0 flex-1">
                <span class="block text-lg font-medium">{{ room.place }}</span>
                <span class="mt-1 block text-sm text-text-secondary">
                  {{ formatRoomTime(room) }}
                </span>
                <span
                  v-if="!canManageRoom(room)"
                  class="mt-1 block text-xs text-status-error"
                  :data-testid="`room-permission-${room.roomId}`"
                >
                  この部屋の管理者ではないため削除できません．
                </span>
              </span>
            </div>
            <span
              class="rounded-full bg-surface-secondary px-3 py-1 text-xs text-text-secondary"
            >
              {{ room.verified ? '確認済み' : '未確認' }}
            </span>
          </li>
        </ul>
      </section>
    </template>
  </main>

  <div
    v-if="isDeleteDialogOpen"
    class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-dialog-title"
  >
    <div
      class="grid max-w-md w-full gap-5 rounded-xl bg-surface-primary p-6 shadow-xl"
    >
      <div>
        <h2 id="delete-dialog-title" h3>進捗部屋を削除しますか？</h2>
        <p class="mt-2 text-sm text-text-secondary">
          選択した{{ selectedCount }}件を削除します．この操作は取り消せません．
        </p>
      </div>
      <div class="flex justify-end gap-3">
        <button
          class="border border-border-primary rounded px-4 py-2 disabled:opacity-50"
          data-testid="cancel-delete"
          :disabled="isDeleting"
          @click="closeDeleteDialog"
        >
          キャンセル
        </button>
        <button
          class="rounded bg-status-error px-4 py-2 text-white font-medium disabled:opacity-50"
          data-testid="confirm-delete"
          :disabled="isDeleting"
          @click="deleteSelectedRooms"
        >
          {{ isDeleting ? '削除中…' : '削除する' }}
        </button>
      </div>
    </div>
  </div>
</template>
