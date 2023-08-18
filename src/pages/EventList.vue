<!-- <template>
</template> -->
<template>
  <div v-if="!events">loading</div>
  <div v-else>
    <div>イベント数:{{ events?.length }}</div>
    <div v-for="event in events" :key="event.eventId">
      {{ event }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api, { type ResponseEvent } from '../api'

const events = ref<ResponseEvent[] | null>(null)

onMounted(async () => {
  const { data } = await api.events.getEvents()
  events.value = data
})
</script>

<style lang="scss" module></style>
