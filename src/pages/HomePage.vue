<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import useSWRV from 'swrv'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { fetcher } from '../lib/fetcher'
import { paths } from '../api/schema'
import createClient from 'openapi-fetch'
// import { useMeStore } from '../store/me'
// const meStore = useMeStore()
// onMounted(async () => await meStore.fetchMe())

const { data, error } = useSWRV<
  paths['/users/me']['get']['responses']['200']['content']['application/json']
>('/users/me', fetcher)
</script>

<template>
  <div v-if="error">failed to load</div>
  <div v-if="!data">loading...</div>
  <div v-else>hello {{ data.name }}</div>
  <RouterLink to="/events">/events</RouterLink>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
