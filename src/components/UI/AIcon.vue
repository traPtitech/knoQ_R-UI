<template>
  <svg width="24" height="24" viewBox="0 0 24 24" role="img" :class="$style.icon">
    <path :d="path" fill="currentColor" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import mdiPaths from '../../assets/mdi'

const props = defineProps<{ name: string }>()

const path = computed(() => mdiPaths[props.name])
</script>

<style lang="scss" module>
.icon {
  contain: strict;
}
</style>
