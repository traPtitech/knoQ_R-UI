<script setup lang="ts">
import { RouterLink } from 'vue-router'
import UserIcon from '/@/components/UI/UserIcon.vue'

defineProps<{
  userId: string
}>()
</script>

<template>
  <RouterLink :to="`/users/${userId}`" inline-flex gap-1 flex-items-center>
    <UserIcon :userId w-6 h-6 />
    {{ userId }}
  </RouterLink>
</template>
