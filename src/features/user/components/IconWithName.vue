<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useUsers } from '/@/features/user/composables/useUsers'

const props = defineProps<{
  userId: string
}>()

const { users } = useUsers()

const user = computed(() => {
  if (!users.value) return
  return users.value.find(user => user.userId === props.userId)
})
</script>

<template>
  <RouterLink :to="`/users/${userId}`" class="inline-flex gap-1 items-center">
    <UserIcon :user-id="userId" :src="user?.icon" class="w-6 h-6" />
    {{ user?.name ?? '' }}
  </RouterLink>
</template>
