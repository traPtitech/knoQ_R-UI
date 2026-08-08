<script setup lang="ts">
import AppHeader from '/@/components/AppHeader.vue'
</script>

<template>
  <AppHeader />
  <div grid mx-auto my-8 max-w-3xl gap-8>
    <slot />
  </div>
</template>
