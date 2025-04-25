<script setup lang="ts">
defineProps<{ userId: string }>()
const userIconLink = (userId: string) =>
  `https://q.trap.jp/api/v3/public/icon/${userId}`
</script>

<template>
  <img :src="userIconLink(userId)" />
</template>
