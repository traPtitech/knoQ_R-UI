<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'
import AppHeader from '/@/components/AppHeader.vue'
import GroupCard from '/@/features/group/components/GroupCard.vue'
import DataFetchState from '/@/components/UI/DataFetchState.vue'

const { data: groups, state } = useApiFetch('/groups', {})
</script>

<template>
  <AppHeader />
  <div grid mx-auto my-8 max-w-3xl gap-4>
    <h2 hl>グループ一覧</h2>
    <DataFetchState :state="state" :is-empty="groups?.length === 0">
      <div class="grid gap-4">
        <GroupCard
          v-for="group in groups"
          :key="group.groupId"
          :group="group"
        />
      </div>
    </DataFetchState>
  </div>
</template>
