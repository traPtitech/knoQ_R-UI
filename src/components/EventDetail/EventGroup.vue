<template>
  <RouterLink :to="link">
    {{ props.groupName }}
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{ groupId: string; groupName: string }>()
const link = computed(() => `/groups/${props.groupId}`)
</script>

<style lang="scss" module></style>
