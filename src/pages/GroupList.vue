<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'
import AppHeader from '/@/components/AppHeader.vue'
import GroupCard from '/@/features/group/components/GroupCard.vue'

const { data: groups, state } = useApiFetch('/groups', {})
</script>

<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-4>
    <h2 hl>グループ一覧</h2>
    <div v-if="state.error">failed to load groups</div>
    <div v-else-if="!groups">loading groups</div>
    <div v-else class="grid gap-4">
      <GroupCard v-for="group in groups" :key="group.groupId" :group="group" />
    </div>
  </div>
</template>
