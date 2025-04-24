<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '/@/assets/logo.svg'
</script>

<template>
  <div
    p-4
    flex
    flex-justify-between
    flex-items-center
    b-b="1 solid border-secondary"
  >
    <RouterLink to="/" justify-self-start>
      <img :src="logo" alt="Logo" w-8 h-8 />
    </RouterLink>
    <div justify-self-center grid grid-cols-3 gap-8>
      <RouterLink hxs to="/">イベント </RouterLink>
      <RouterLink hxs to="/">イベント </RouterLink>
      <RouterLink hxs to="/">探す</RouterLink>
    </div>
    <RouterLink to="/" justify-self-end>
      <img src="../assets/logo.png" alt="Logo" w-8 h-8 />
    </RouterLink>
  </div>
</template>
