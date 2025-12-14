<script setup lang="ts">
const props = defineProps<{ userId: string; src?: string }>()
const userIconLink = (userId: string) =>
  `https://q.trap.jp/api/v3/public/icon/${userId}`
</script>

<template>
  <img
    :src="props.src ?? userIconLink(props.userId)"
    :alt="`${props.userId}'s icon`"
    class="h-8 w-8 rounded-full"
  />
</template>
