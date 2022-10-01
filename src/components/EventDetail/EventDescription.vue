<template>
  <div>{{ props.description }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{ description: String }>();
</script>

<style lang="scss" module></style>
