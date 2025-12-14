<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '/@/components/AppHeader.vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import SelectMenu from '/@/components/UI/SelectMenu.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { apiClient } from '/@/lib/api'
import { useGroups } from '/@/features/group/composables/useGroups'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useMe } from '/@/features/user/composables/useMe'
import type { components } from '/@/lib/api/schema'

type Room = components['schemas']['ResponseRoom']

const router = useRouter()
const { groups, getGroups } = useGroups()
const { users } = useUsers()
const { me } = useMe()

const rooms = ref<Room[]>([])
const isLoading = ref(true)
const statusMessage = ref('')
const isError = ref(false)
const errors = ref<Record<string, string>>({})

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

onMounted(async () => {
  try {
    await Promise.all([getGroups(), apiClient.GET('/rooms')])
    const res = await apiClient.GET('/rooms')
    if (res.data) {
      rooms.value = res.data
    }
  } catch (e) {
    console.error(e)
    statusMessage.value = 'データの読み込みに失敗しました'
    isError.value = true
  } finally {
    isLoading.value = false
  }
})

const roomItems = computed(() =>
  rooms.value.map((r) => ({ id: r.roomId, name: r.place }))
)

const groupItems = computed(() =>
  groups.value.map((g) => ({ id: g.groupId, name: g.name }))
)

const selectedGroupName = computed(
  () => groups.value.find((g) => g.groupId === form.value.groupId)?.name
)

const adminItems = computed(() => {
  if (!users.value) return []
  return users.value
    .filter(
      (u) =>
        !form.value.admins.includes(u.userId) && u.userId !== me.value?.userId
    )
    .map((u) => ({ id: u.userId, name: u.name }))
})

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
    if (form.value.roomId) {
      const room = rooms.value.find((r) => r.roomId === form.value.roomId)
      if (room && room.place !== newVal) {
        form.value.roomId = undefined
      }
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
  if (!validate()) {
    statusMessage.value = '入力内容を確認してください'
    isError.value = true
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
    timeStart: new Date(form.value.timeStart).toISOString(),
    timeEnd: new Date(form.value.timeEnd).toISOString(),
    sharedRoom: form.value.sharedRoom,
    open: form.value.open,
    admins: admins,
    tags: []
  }

  let res
  if (form.value.roomId) {
    // Stock Event
    res = await apiClient.POST('/events', {
      body: {
        ...commonBody,
        roomId: form.value.roomId
      } as any
    })
  } else {
    // Instant Event
    res = await apiClient.POST('/events', {
      body: {
        ...commonBody,
        place: form.value.place
      } as any
    })
  }

  if (res.error) {
    statusMessage.value = 'エラーが発生しました'
    isError.value = true
    console.error(res.error)
  } else if (res.data) {
    statusMessage.value = '作成しました'
    router.push(`/events/${res.data.eventId}`)
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
    <h2 h2>イベントを作成する</h2>

    <div grid gap-6 card>
      <h3 h3>基本情報</h3>
      <div grid gap-1>
        <InputField
          id="event-name"
          v-model="form.name"
          label="イベント名"
          placeholder="例: 第N回進捗会"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
      </div>

      <div grid gap-1>
        <h5 h5>主催グループ</h5>
        <SelectMenu
          :label="selectedGroupName || 'グループを選択'"
          :items="groupItems"
          @select="selectGroup"
        />
        <p v-if="errors.groupId" class="text-xs text-red-500">
          {{ errors.groupId }}
        </p>
      </div>

      <TextareaField
        id="event-desc"
        v-model="form.description"
        label="イベント概要"
        rows="5"
      />

      <div class="flex items-center gap-4">
        <label class="flex cursor-pointer items-center gap-2">
          <input v-model="form.open" type="checkbox" class="h-4 w-4" />
          <span class="text-sm">誰でも参加可能にする</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input v-model="form.sharedRoom" type="checkbox" class="h-4 w-4" />
          <span class="text-sm">部屋を共有可能にする</span>
        </label>
      </div>
    </div>

    <div grid gap-6 card>
      <h3 h3>場所と日時</h3>

      <div grid gap-1>
        <h5 h5>場所</h5>
        <div flex flex-col gap-2>
          <div flex items-center gap-2>
            <InputField
              id="event-place"
              v-model="form.place"
              placeholder="場所を入力"
              class="flex-1"
            />
            <span text-sm text-text-secondary>または</span>
            <SelectMenu
              label="部屋を選択"
              :items="roomItems"
              @select="selectRoom"
            />
          </div>
          <p
            v-if="form.roomId"
            class="flex items-center gap-1 text-xs text-green-600"
          >
            <span i-mdi:check-circle /> 既存の部屋「{{
              rooms.find((r) => r.roomId === form.roomId)?.place
            }}」が選択されています
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div grid gap-1>
          <InputField
            id="time-start"
            v-model="form.timeStart"
            label="開始日時"
            type="datetime-local"
            :class="{ 'border-red-500': errors.timeStart }"
          />
          <p v-if="errors.timeStart" class="text-xs text-red-500">
            {{ errors.timeStart }}
          </p>
        </div>
        <div grid gap-1>
          <InputField
            id="time-end"
            v-model="form.timeEnd"
            label="終了日時"
            type="datetime-local"
            :class="{ 'border-red-500': errors.timeEnd }"
          />
          <p v-if="errors.timeEnd" class="text-xs text-red-500">
            {{ errors.timeEnd }}
          </p>
        </div>
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
            <UserIcon :user-id="adminId" class="h-6 w-6" />
            <span class="text-sm">{{
              users?.find((u) => u.userId === adminId)?.name || adminId
            }}</span>
            <button
              class="text-text-secondary transition-colors hover:text-red-500"
              @click="removeAdmin(adminId)"
            >
              <span i-mdi:close class="block" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p
            v-if="form.admins.length === 0"
            class="text-sm text-text-secondary"
          >
            追加の管理者は選択されていません
          </p>
          <SelectMenu
            label="管理者を追加"
            :items="adminItems"
            @select="addAdmin"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <PrimaryButton @click="onSubmit">イベントを作成</PrimaryButton>
      <span
        v-if="statusMessage"
        :class="isError ? 'text-red-500' : 'text-green-600'"
        class="text-sm font-bold"
      >
        {{ statusMessage }}
      </span>
    </div>
  </div>
</template>
