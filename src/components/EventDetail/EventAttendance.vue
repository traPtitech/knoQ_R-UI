<template>
  <div v-for="attendee in props.attendees" :key="attendee.name">
    {{ attendee.name }}
    {{ attendee.schedule }}
  </div>
</template>

<script setup lang="ts">
import { AttendanceState } from "../../types";

const props = defineProps<{
  attendees: { name: string; schedule: AttendanceState }[];
}>();
</script>

<style lang="scss" module></style>
