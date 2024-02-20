<template>
  <div />
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { login } from '/@/features/auth/api'

onMounted(async () => {
  const { data } = await login()
  if (data) window.location.assign(data.url)
})
</script>
