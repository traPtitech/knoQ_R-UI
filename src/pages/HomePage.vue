<template>
  <div v-if="meError">failed to load</div>
  <div v-if="!me">loading me</div>
  <div v-else>hello {{ me.name }}</div>
  <div v-if="todayEventsError">failed to load events</div>
  <div v-if="!todayEvents">loading events</div>
  <div v-else>{{ todayEvents.map((event) => event.name) }}</div>
  <RouterLink to="/events">/events</RouterLink>
  <div>{{ data?.map((v) => v.name) }}</div>
  <div>{{ error }}</div>
</template>

<script setup lang="ts">
import useSWRV from 'swrv'
import { RouterLink } from 'vue-router'
import { fetcher } from '../lib/fetcher'
import { paths } from '../api/schema'
import { useApiSWRV } from '../composables/useApiSWRV'

const { data: me, error: meError } = useSWRV<
  paths['/users/me']['get']['responses']['200']['content']['application/json']
>('/users/me', fetcher)

const { data: todayEvents, error: todayEventsError } = useSWRV<
  paths['/events']['get']['responses']['200']['content']['application/json']
>('/events', fetcher)
const { data, error } = useApiSWRV('/events', {
  params: {
    query: { dateBegin: '2023-09-27T00:00:00+09:00', dateEnd: '2023-09-27T23:59:59+09:00' }
  }
})
</script>
