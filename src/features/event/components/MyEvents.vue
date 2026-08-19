<script setup lang="ts">
import { RouterLink } from 'vue-router'

const {isEventAdmin} = defineProps<{
  eventDate: string
  eventName: string
  eventId: string
  isEventAdmin?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-[3em_1fr_5em] gap-4 border-b border-border-primary p-4">
    <span class="text-text-secondary">
      {{ eventDate }}
    </span>
    <RouterLink :to="`/events/${eventId}`" class="link">
      {{ eventName }}
    </RouterLink>
    <button v-if="isEventAdmin" class="btn-secondary justify-self-end text-[13px]" @click="(()=> {console.log(`[${eventName}]編集ボタンが押されました`)})">
      編集
    </button>
  </div>
</template>
