<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'
import AppHeader from '/@/components/AppHeader.vue'
import EventCard from '/@/features/event/components/EventCard.vue'
import InputField from '../components/UI/Form/InputField.vue'
import DataFetchState from '/@/components/UI/DataFetchState.vue'

const { data: events, state } = useApiFetch('/events', {})
const modelValue = defineModel<string>('')
</script>

<template>
  <AppHeader />
  <div grid mx-auto my-8 max-w-3xl gap-4>
    <h1 hl>イベント</h1>
    <div>
      <h2 hl>検索</h2>
      <InputField id="search" v-model="modelValue" />
    </div>
    <DataFetchState :state="state" :is-empty="events?.length === 0">
      <div class="grid gap-4">
        <EventCard
          v-for="event in events"
          :key="event.eventId"
          :event="event"
        />
      </div>
    </DataFetchState>
  </div>
</template>
