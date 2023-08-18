<template>
  グループ数: {{ groups?.length }}
  <div v-for="group in groups" :key="group.groupId">
    {{ group }}
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api, { ResponseGroup } from '../api'

const groups = ref<ResponseGroup[] | null>(null)
onMounted(async () => {
  const { data } = await api.groups.getGroups()
  groups.value = data
})
</script>
