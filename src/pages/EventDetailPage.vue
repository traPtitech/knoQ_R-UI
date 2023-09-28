<template>
  <div>
    <h2>イベント</h2>
    <div v-if="error">failed to fetch</div>
    <div v-else-if="!event">loading</div>
    <div v-else>{{ event }}</div>
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

const route = useRoute()
const eventId = computed(() => {
  return getFirstParam(route.params.id)
})

const { data: event, error } = useApiSWRV('/events/{eventID}', {
  params: { path: { eventID: eventId.value } }
})

const { canChange, mySchedule, updateMyAttendance } = useMyAttendance(event)
</script>

<style lang="scss" module>
.section {
  @include color-ui-secondary;
  font-size: 1rem;
}
</style>
