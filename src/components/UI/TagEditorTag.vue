<template>
  <span>
    <span> {{ props.tag }} </span>
    <button>x</button>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  tag: string;
}>();
</script>
