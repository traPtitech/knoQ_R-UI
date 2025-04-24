<script setup lang="ts">
import { ComputedRef, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchEvent } from '../features/event/api'
import { useMySchedule } from '../features/event/composables/useMySchedule'
import { useMe } from '/@/features/user/composables/useMe'
import { Schedule } from '/@/features/event/types'
import AppHeader from '/@/components/AppHeader.vue'
import AttendingEventList from '../features/event/components/AttendingEventList.vue'
import IconWithName from '../features/user/components/IconWithName.vue'
import AttendanceButton from '../features/event/components/AttendanceButton.vue'
import SchedulePoll from '../features/event/components/SchedulePoll.vue'
import InvitationLinkButton from '../features/event/components/InvitationLinkButton.vue'
import DescriptionMd from '../features/event/components/DescriptionMd.vue'

const route = useRoute()
const router = useRouter()
const eventId: ComputedRef<string> = computed(() => route.params.id as string)

const { event, error, mutate, state } = fetchEvent(eventId.value)
const { me } = useMe()
const { canUpdate, mySchedule, updateMySchedule } = useMySchedule(me, event)

const onUpdateMySchedule = async (schedule: Schedule) => {
  await updateMySchedule(schedule)
  mutate()
}

const onDeleteEvent = async () => {
  router.push('/')
}
</script>

<template>
  <AppHeader />
  <div grid grid-cols-2>
    <AttendingEventList />
    <div>
      <!-- <div v-if="error">failed to fetch</div> -->
      <!-- <div v-else-if="!event">loading</div> -->
      <!-- <div v-else> -->
      <h1>機械学習講習会</h1>
      <div flex gap-2>
        <p>by</p>
        <IconWithName userId="itt" />
      </div>
      <AttendanceButton />
      <h2>日程調整</h2>
      <SchedulePoll />
      <InvitationLinkButton />
      <DescriptionMd
        :markdown="`# テスト
## 22
|a1|2|
|-|-|
|b|c|
<h1>ほげ</h1>
`"
      />

      <!-- <div>
        <h3>タグ</h3>
        <TagsEditor
          :tags="event.tags"
          @add="onAddTag"
          @delete="onDeleteTag"
          @update="onUpdateLockState"
        />
      </div> -->
      <!-- <h3>あなたの出席</h3> -->
      <!-- <MySchedule -->
      <!-- :can-change="canUpdate" -->
      <!-- :schedule="mySchedule" -->
      <!-- @change="onUpdateMySchedule" -->
      <!-- /> -->
      <!-- <div> -->
      <!-- <h3>イベント削除</h3> -->
      <!-- <button @click="onDeleteEvent">削除</button> -->
      <!-- </div> -->
    </div>
  </div>
  <!-- </div> -->
</template>
