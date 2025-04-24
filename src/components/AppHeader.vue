<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div grid grid-cols="[1fr_auto_1fr]" grid-items-center>
    <RouterLink to="/" justify-self-start>
      <img src="../assets/logo.png" alt="Logo" w-8 h-8 />
    </RouterLink>
    <div justify-self-center grid grid-cols-3 gap-8>
      <RouterLink to="/">イベント </RouterLink>
      <RouterLink to="/">イベント </RouterLink>
      <RouterLink to="/">イベント </RouterLink>
    </div>
    <RouterLink to="/" justify-self-end>
      <img src="../assets/logo.png" alt="Logo" w-8 h-8 />
    </RouterLink>
  </div>
</template>
