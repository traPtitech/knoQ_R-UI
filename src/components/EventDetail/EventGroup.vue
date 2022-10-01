<template>
  <div>{{ props.group.name }}</div>
</template>

<script setup lang="ts">
import { ResponseGroup } from "../../api/generated";

const props = defineProps<{ group: ResponseGroup }>();
</script>

<style lang="scss" module></style>
