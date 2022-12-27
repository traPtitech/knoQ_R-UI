<template>
  <user-icon :user-name="me?.name!" />
  {{ me?.name }}
  {{ props.myAttendance }}
  <button @click="emits('change', RequestScheduleScheduleEnum.Absent)">
    出席
  </button>
</template>

<script setup lang="ts">
import { RequestScheduleScheduleEnum } from "../../api/generated";
import { meStore } from "../../store/me";
import UserIcon from "../UI/UserIcon.vue";

const props = defineProps<{
  myAttendance: RequestScheduleScheduleEnum;
}>();

const emits = defineEmits<{
  /*eslint-disable no-unused-vars*/
  (e: "change", newAttendance: RequestScheduleScheduleEnum): void;
}>();
const { me } = meStore();
</script>

<style lang="scss" module></style>
