<template>
  {{ state }}
  {{ events }}
</template>

<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'

const { data: events, state } = useApiFetch('/events', {})
</script>

<style lang="scss" module></style>
