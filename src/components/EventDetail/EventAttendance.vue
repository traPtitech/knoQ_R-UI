<template>
  <div v-for="attendee in props.attendees" :key="attendee.name">
    <UserIcon :user-name="attendee.name" />
    {{ attendee.name }}
    {{ attendee.schedule }}
  </div>
</template>

<script setup lang="ts">
import { AttendanceState } from '../../types'
import UserIcon from '../UI/UserIcon.vue'

const props = defineProps<{
  attendees: { name: string; schedule: AttendanceState }[]
}>()
</script>

<style lang="scss" module></style>
