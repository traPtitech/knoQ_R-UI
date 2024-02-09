<template>
  <div>
    <h2>イベント</h2>
    <div>{{ state }}</div>
    <div v-if="error">failed to fetch</div>
    <div v-else-if="!event">loading</div>
    <div v-else>
      {{ event }}
      <!-- <div>
        <h3>タグ</h3>
        <TagsEditor
          :tags="event.tags"
          @add="onAddTag"
          @delete="onDeleteTag"
          @update="onUpdateLockState"
        />
      </div> -->
    </div>
    <h3>あなたの出席</h3>
    <MySchedule
      :can-change="canUpdate"
      :schedule="mySchedule"
      @change="onUpdateMySchedule"
    />
  </div>
  <div>
    <h3>イベント削除</h3>
    <button @click="onDeleteEvent">削除</button>
  </div>
</template>

<script setup lang="ts">
import MySchedule from '/@/features/event/components/MySchedule.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFirstParam } from '../lib/params'
import { fetchEvent } from '../features/event/api'
import { useMySchedule } from '../features/event/composables/useMySchedule'
import { useMe } from '/@/composables/useMe'
import { Schedule } from '/@/features/event/types'

const route = useRoute()
const router = useRouter()
const eventId = computed(() => {
  return getFirstParam(route.params.id)
})

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

<style lang="scss" module>
.section {
  @include color-ui-secondary;
  font-size: 1rem;
}
</style>
