<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useUsers } from '/@/features/user/composables/useUsers'

const props = defineProps<{
  userId: string
}>()

const { users } = useUsers()

const userName = computed(() => {
  if (!users.value) return ''
  const user = users.value.find(user => user.userId === props.userId)
  return user?.name ?? ''
})
</script>

<template>
  <RouterLink :to="`/users/${userId}`" class="inline-flex gap-1 items-center">
    <UserIcon :user-id="userId" class="w-6 h-6" />
    {{ userName }}
  </RouterLink>
</template>
