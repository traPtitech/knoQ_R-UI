<script setup lang="ts">
import AppHeader from '/@/components/AppHeader.vue'
defineProps<{ wide?: boolean }>()
</script>

<template>
  <AppHeader />
  <main
    class="grid mx-auto my-8 w-full gap-8 px-5 sm:px-8"
    :class="wide ? 'max-w-6xl' : 'max-w-3xl'"
  >
    <slot />
  </main>
</template>
