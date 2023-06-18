<template>
  <UserIcon :userName="name" />

  <div v-if="!props.myAttendance">
    <button @click="emits('change', 'attendance')">出席</button>
  </div>
  <div v-else>
    <button @click="emits('change', 'attendance')">出席</button>
    <button @click="emits('change', 'absent')">欠席</button>
    <button @click="emits('change', 'pending')">未定</button>
  </div>
</template>

<script setup lang="ts">
import { useMeStore } from '../../store/me'
import { AttendanceState } from '../../types'
import UserIcon from '../UI/UserIcon.vue'
import { computed } from 'vue'

const props = defineProps<{
  myAttendance?: AttendanceState
}>()

const emits = defineEmits<{
  /*eslint-disable no-unused-vars*/
  (e: 'change', newAttendance: AttendanceState): void
}>()
const meStore = useMeStore()
const name = computed(() => meStore.me?.name!)
</script>

<style lang="scss" module></style>
