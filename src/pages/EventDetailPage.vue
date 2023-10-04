<template>
  <div>
    <h2>イベント</h2>
    <div v-if="error">failed to fetch</div>
    <div v-else-if="!event">loading</div>
    <div v-else>
      {{ event }}
      <div>
        <h3>タグ</h3>
        <TagsEditor
          :tags="event.tags"
          @add="onAddTag"
          @delete="onDeleteTag"
          @update="onUpdateLockState"
        />
      </div>
    </div>
  </div>
  <div>
    <h3>あなたの出席</h3>
    <MyAttendance @change="updateMyAttendance" :canChange="canChange" :schedule="mySchedule" />
  </div>
</template>

<script setup lang="ts">
import MyAttendance from '../features/event/components/MyAttendance.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFirstParam } from '../lib/params'
import { useApiSWRV } from '../composables/useApiSWRV'
import { useMyAttendance } from '../features/event/composables/useMyAttendance'
import TagsForm from '../features/tag/components/TagsForm.vue'
import TagsEditor from '../features/tag/components/TagsEditor.vue'
import { client } from '../api'

const route = useRoute()
const eventId = computed(() => {
  return getFirstParam(route.params.id)
})

const {
  data: event,
  error,
  mutate
} = useApiSWRV('/events/{eventID}', {
  params: { path: { eventID: eventId.value } }
})
const { canChange, mySchedule, updateMyAttendance } = useMyAttendance(event)

const onAddTag = async (name: string) => {
  await client.POST('/events/{eventID}/tags', {
    params: { path: { eventID: eventId.value } },
    body: { name }
  })
  mutate()
}
const onDeleteTag = async (name: string) => {
  await client.DELETE('/events/{eventID}/tags/{tagName}', {
    params: { path: { eventID: eventId.value, tagName: name } }
  })
  mutate()
}
const onUpdateLockState = async (name: string, locked: boolean) => {
  // TODO
  mutate()
}
</script>

<style lang="scss" module>
.section {
  @include color-ui-secondary;
  font-size: 1rem;
}
</style>
