<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import AppHeader from '../components/AppHeader.vue'
import SelectMenu from '/@/components/UI/SelectMenu.vue'
import { useTags } from '/@/features/tag/composables/useTags'
import { useEvents } from '/@/features/event/composables/useEvents'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useGroups } from '/@/features/group/composables/useGroups'
import { apiClient } from '/@/lib/api'
import { useMe } from '/@/features/user/composables/useMe'

const { me } = useMe()
const icalSecret = ref('')
const eventFilter = ref('')
const dateBegin = ref('')
const dateEnd = ref('')

const { tags, getTags } = useTags()
const { events, getEvents } = useEvents()
const { users } = useUsers()
const { groups, getGroups } = useGroups()

const fetchIcalSecret = async () => {
  const res = await apiClient.GET('/users/me/ical')
  if (res.data) {
    icalSecret.value = res.data.secret
  }
}

const resetIcalSecret = async () => {
  if (
    !confirm('iCalのシークレットを再生成しますか？既存のURLは無効になります。')
  )
    return
  const res = await apiClient.PUT('/users/me/ical')
  if (res.data) {
    icalSecret.value = res.data.secret
  }
}

onMounted(() => {
  fetchIcalSecret()
  getTags()
  getEvents()
  getGroups()
})

const icalToken = computed(() => {
  if (me.value && icalSecret.value) {
    return me.value.userId + icalSecret.value
  }
  return ''
})

const icalUrl = computed(() => {
  if (!icalToken.value) return ''

  let url = `${window.location.origin}/api/ical/v1/${icalToken.value}`
  const params = []

  if (eventFilter.value) {
    params.push(`q=${encodeURIComponent(eventFilter.value)}`)
  }
  if (dateBegin.value) {
    params.push(`dateBegin=${new Date(dateBegin.value).toISOString()}`)
  }
  if (dateEnd.value) {
    params.push(`dateEnd=${new Date(dateEnd.value).toISOString()}`)
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  return url
})

const copyToClipboard = async () => {
  if (icalUrl.value) {
    await navigator.clipboard.writeText(icalUrl.value)
    alert('iCal URL copied to clipboard!')
  }
}

const appendFilter = (filter: string) => {
  if (eventFilter.value) {
    eventFilter.value += ` || ${filter}`
  } else {
    eventFilter.value = filter
  }
}

const clearFilter = () => {
  eventFilter.value = ''
}

const selectTag = (item: { id: string; name: string }) => {
  appendFilter(`tag==${item.id}`)
}

const selectEvent = (item: { id: string; name: string }) => {
  appendFilter(`event==${item.id}`)
}

const selectUser = (item: { id: string; name: string }) => {
  appendFilter(`user==${item.id}`)
}

const selectGroup = (item: { id: string; name: string }) => {
  appendFilter(`group==${item.id}`)
}
</script>

<template>
  <AppHeader />
  <div class="grid mx-auto max-w-4xl gap-8 p-4">
    <div flex items-center justify-between>
      <h1 h1>iCal URL 生成</h1>
      <button
        class="text-sm text-red-600 hover:underline"
        @click="resetIcalSecret"
      >
        シークレットを再生成
      </button>
    </div>

    <div grid gap-4 card>
      <div grid gap-2>
        <h2 h2>プレビュー & URL</h2>
        <div
          class="break-all border border-border-secondary rounded bg-surface-secondary p-4 text-sm font-mono"
        >
          {{ icalUrl || 'Loading...' }}
        </div>
        <PrimaryButton
          :disabled="!icalUrl"
          class="justify-self-start"
          @click="copyToClipboard"
        >
          URLをコピー
        </PrimaryButton>
      </div>
    </div>

    <div grid gap-6 card>
      <h2 h2>フィルタ設定</h2>

      <div grid gap-2>
        <TextareaField
          id="query-filter"
          v-model="eventFilter"
          label="検索クエリ (q)"
        />

        <div class="flex flex-wrap items-center gap-2">
          <SelectMenu
            label="タグを追加"
            :items="tags.map((t) => ({ id: t.tagId, name: t.name }))"
            @select="selectTag"
          />
          <SelectMenu
            label="イベントを追加"
            :items="events.map((e) => ({ id: e.eventId, name: e.name }))"
            @select="selectEvent"
          />
          <SelectMenu
            label="ユーザーを追加"
            :items="(users ?? []).map((u) => ({ id: u.userId, name: u.name }))"
            @select="selectUser"
          />
          <SelectMenu
            label="グループを追加"
            :items="groups.map((g) => ({ id: g.groupId, name: g.name }))"
            @select="selectGroup"
          />

          <button
            class="px-2 text-sm text-text-secondary hover:text-text-primary"
            @click="clearFilter"
          >
            クリア
          </button>
        </div>

        <details
          class="mt-2 border border-border-secondary rounded bg-surface-secondary/20 p-2 text-sm text-text-secondary"
        >
          <summary class="cursor-pointer select-none font-bold">
            構文ヘルプ
          </summary>
          <div class="mt-2 text-xs font-mono space-y-1">
            <p>Syntax: <code>top : ε | expr</code></p>
            <p><code>expr : term ( ( "||" | "&&" ) term)*</code></p>
            <p><code>term : cmp | "(" expr ")"</code></p>
            <p><code>cmp : Attr ( "==" | "!=" ) UUID</code></p>
            <p><code>Attr : "event" | "user" | "group" | "tag"</code></p>
            <p class="mt-2 text-text-primary">
              例:
              <code>event==xxxxxxxx... || tag==yyyyyyyy...</code>
            </p>
          </div>
        </details>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          id="date-begin"
          v-model="dateBegin"
          label="開始日時 (任意)"
          type="datetime-local"
        />
        <InputField
          id="date-end"
          v-model="dateEnd"
          label="終了日時 (任意)"
          type="datetime-local"
        />
      </div>
    </div>
  </div>
</template>
