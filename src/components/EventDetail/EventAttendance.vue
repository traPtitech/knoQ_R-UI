<template>
  <div v-for="attendee in props.attendees" :key="attendee.userId">
    {{ attendee.userId }}
    {{ attendee.schedule }}
  </div>
</template>

<script setup lang="ts">
import { ResponseEventAttendeesInner } from "../../api/generated";
const props = defineProps<{ attendees: ResponseEventAttendeesInner[] }>();
</script>

<style lang="scss" module></style>
