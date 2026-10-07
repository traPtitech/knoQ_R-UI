<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useUsers } from '/@/features/user/composables/useUsers'

const props = defineProps<{ userIds: string[] }>()
const { users } = useUsers()
const failedIcons = ref<string[]>([])
const visibleAttendees = computed(() =>
  props.userIds.slice(0, 8).map((id) => ({
    id,
    user: users.value?.find((user) => user.userId === id)
  }))
)
// 参加者やユーザー情報の更新時は、失敗したアイコンも再取得する。
watch(visibleAttendees, () => {
  failedIcons.value = []
})
const remaining = computed(() => Math.max(0, props.userIds.length - 8))
</script>

<template>
  <span
    class="flex items-center text-xs text-text-secondary"
    :title="`参加者 ${userIds.length}人`"
  >
    <span class="sr-only">参加者 {{ userIds.length }}人</span>
    <span v-if="userIds.length === 0" aria-hidden="true">0人</span>
    <span v-else class="flex items-center -space-x-3">
      <span
        v-for="attendee in visibleAttendees"
        :key="attendee.id"
        class="relative box-content h-6 w-6 inline-flex shrink-0 items-center justify-center border-2 border-surface-primary rounded-full bg-surface-secondary"
        :title="attendee.user?.name ? `@${attendee.user.name}` : '参加者'"
      >
        <UserIcon
          v-if="attendee.user?.name && !failedIcons.includes(attendee.id)"
          :user-id="attendee.user.name"
          :src="attendee.user.icon || undefined"
          loading="lazy"
          class="!h-6 !w-6"
          @error="failedIcons = [...failedIcons, attendee.id]"
        />
        <span
          v-else
          class="i-mdi:account-outline text-base"
          role="img"
          :aria-label="attendee.user?.name ?? '参加者'"
        />
      </span>
      <span
        v-if="remaining"
        class="relative box-content h-6 min-w-6 inline-flex items-center justify-center border-2 border-surface-primary rounded-full bg-surface-secondary px-1 font-medium"
        :aria-label="`ほか${remaining}人`"
        >+{{ remaining }}</span
      >
    </span>
  </span>
</template>
