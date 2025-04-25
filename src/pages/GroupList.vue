<template>
  {{ state }}
  {{ groups }}
</template>

<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'

const { data: groups, state } = useApiFetch('/groups', {})
</script>
