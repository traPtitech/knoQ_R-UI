<template>
  <user-icon :user-name="props.me.name" />
  {{ props.me.name }}
</template>

<script setup lang="ts">
import { ResponseUser } from "../../api/generated";
import UserIcon from "../UI/UserIcon.vue";
const props = defineProps<{ me: ResponseUser }>();
</script>

<style lang="scss" module></style>
