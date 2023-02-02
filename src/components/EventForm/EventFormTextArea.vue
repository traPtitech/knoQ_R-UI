<template>
  <div>
    <textarea :placeholder="props.placeHolder" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  placeHolder: string;
}>();
</script>
