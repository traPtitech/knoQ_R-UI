<script setup lang="ts">
import type { Group } from '../types'

defineProps<{ group: Group }>()
</script>

<template>
  <div card>
    <RouterLink :to="`/groups/${group.groupId}`">
      <h3 hm>{{ group.name }}</h3>
      <p>{{ group.description }}</p>
    </RouterLink>
  </div>
</template>
