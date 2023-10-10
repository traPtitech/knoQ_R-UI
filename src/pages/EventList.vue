<!-- <template>
</template> -->
<template>
  <div v-if="error">failed to load</div>
  <div v-if="!data">loading...</div>
  <div v-else>hello {{ data.name }}</div>
  <RouterLink to="/">/</RouterLink>
</template>

<script setup lang="ts">
import useSWRV from 'swrv'
import { fetcher } from '../lib/fetcher'
import { paths } from '../api/schema'
import createClient from 'openapi-fetch'

// const { data, error } = useSWRV<
//   paths['/users/me']['get']['responses']['200']['content']['application/json']
// >('/users/me', async (s) => await fetcher(s, {}))
const { data, error } = useSWRV<
  paths['/users/me']['get']['responses']['200']['content']['application/json']
>('/users/me', fetcher)
</script>

<style lang="scss" module></style>
../lib/schema
