<script setup lang="ts">
import type { components } from '/@/lib/api/schema'
import RoomCard from './RoomCard.vue'

type Room = components['schemas']['ResponseRoom']

defineProps<{
  rooms: Room[]
}>()
</script>

<template>
  <div grid grid-cols-2 gap-4>
    <RoomCard v-for="room in rooms" :key="room.roomId" :room="room" />
  </div>
</template>
