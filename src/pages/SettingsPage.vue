<template>url: {{ icalSecret }}</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../api'
import { useMeStore } from '../store/me'

const icalSecret = ref<string | null>(null)
const useMe = useMeStore()
onMounted(async () => {
  icalSecret.value = await (await api.users.getIcalSecret()).data.secret
})
</script>
