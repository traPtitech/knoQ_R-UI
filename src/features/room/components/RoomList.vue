<script setup lang="ts">
import type { components } from '/@/lib/api/schema'
import RoomCard from './RoomCard.vue'

type Room = components['schemas']['ResponseRoom']

defineProps<{
  rooms: Room[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <RoomCard v-for="room in rooms" :key="room.roomId" :room="room" />
  </div>
</template>
