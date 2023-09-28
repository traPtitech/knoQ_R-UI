<template>
  <h4>現在の出席状況</h4>
  <div v-if="schedule === null">グループ外</div>
  <div v-else-if="schedule === undefined">loading</div>
  <div v-else>{{ schedule }}</div>
  <h4>出席を変更可能か</h4>
  <div v-if="canChange === undefined">loading</div>
  <div v-else>{{ canChange }}</div>
  <button type="button" @click="emits('change', 'attendance')">出席</button>
  <button type="button" @click="emits('change', 'absent')">欠席</button>
  <button type="button" @click="emits('change', 'pending')">未定</button>
</template>

<script setup lang="ts">
import { Schedule } from '..'
const emits = defineEmits<{ (e: 'change', value: Schedule): void }>()
const props = defineProps<{
  schedule: Schedule | null | undefined
  canChange: boolean | undefined
}>()
</script>
