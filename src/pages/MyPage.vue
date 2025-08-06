<script setup lang="ts">
import AppHeader from '/@/components/AppHeader.vue'
import { useMe } from '/@/features/user/composables/useMe'
import { useApiFetch } from '/@/composables/useApiFetch'
import { RouterLink } from 'vue-router'

const { me } = useMe()

const { data: myEvents } = useApiFetch('/users/me/events', {
  params: { query: { relation: 'attendees' } }
})

const { data: myGroups } = useApiFetch('/users/me/groups', {})
</script>

<template>
  <AppHeader />
  <div v-if="me" max-w-3xl my-8 mx-auto grid gap-4>
    <h2 hl>マイページ</h2>
    <div card grid gap-6>
      <h3 hm>プロフィール</h3>
      <p>名前: {{ me.name }}</p>
      <p>表示名: {{ me.displayName }}</p>
    </div>
    <div card grid gap-6>
      <h3 hm>あなたのイベント</h3>
      <div v-if="!myEvents">loading events</div>
      <div v-else>
        <div v-for="event in myEvents" :key="event.eventId">
          <RouterLink :to="`/events/${event.eventId}`">
            {{ event.name }}
          </RouterLink>
        </div>
      </div>
    </div>
    <div card grid gap-6>
      <h3 hm>あなたのグループ</h3>
      <div v-if="!myGroups">loading groups</div>
      <div v-else>
        <!-- <div v-for="group in myGroups" :key="group.groupId"> -->
          <!-- <RouterLink :to="`/groups/${group.groupId}`"> -->
            <!-- {{ group.name }} -->
          <!-- </RouterLink> -->
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>
