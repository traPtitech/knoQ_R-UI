<script setup lang="ts">
import AppHeader from '/@/components/AppHeader.vue'
</script>

<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-8>
    <slot />
  </div>
</template>
