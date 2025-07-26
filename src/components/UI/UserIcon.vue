<script setup lang="ts">
const props = defineProps<{ userId: string; src?: string }>()
const userIconLink = (userId: string) =>
  `https://q.trap.jp/api/v3/public/icon/${userId}`
</script>

<template>
  <img
    :src="props.src ?? userIconLink(props.userId)"
    :alt="`${props.userId}'s icon`"
    class="w-8 h-8 rounded-full"
  />
</template>
