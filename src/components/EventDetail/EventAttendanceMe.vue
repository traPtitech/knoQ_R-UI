<template>
  <div v-if="!me">loading</div>
  <div v-else>
    <user-icon :user-name="me.name" />
    {{ me.name }}
  </div>
  <div v-if="!props.myAttendance">loading</div>
  <div v-else>
    {{ props.myAttendance }}
  </div>
  <button @click="emits('change', RequestScheduleScheduleEnum.Attendance)">
    出席
  </button>
</template>

<script setup lang="ts">
import { RequestScheduleScheduleEnum } from "../../api/generated";
import { meStore } from "../../store/me";
import UserIcon from "../UI/UserIcon.vue";

const props = defineProps<{
  myAttendance?: RequestScheduleScheduleEnum;
}>();

const emits = defineEmits<{
  /*eslint-disable no-unused-vars*/
  (e: "change", newAttendance: RequestScheduleScheduleEnum): void;
}>();
const { me } = meStore();
</script>

<style lang="scss" module></style>
