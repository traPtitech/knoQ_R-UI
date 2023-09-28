<template>
  {{ schedule }}
  <button type="button" @click="emits('change', 'attendance')">出席</button>
  <button type="button" @click="emits('change', 'absent')">欠席</button>
  <button type="button" @click="emits('change', 'pending')">未定</button>
</template>

<script setup lang="ts">
import { Schedule } from '..'
const emits = defineEmits<{ (e: 'change', value: Schedule): void }>()
const props = defineProps<{ schedule: Schedule }>()
</script>
