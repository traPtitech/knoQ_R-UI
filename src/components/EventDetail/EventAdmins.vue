<template>
  <div v-for="admin in props.admins" :key="admin">
    <user-icon user-name="itt" />
  </div>
</template>

<script setup lang="ts">
import UserIcon from "../UI/UserIcon.vue";
const props = defineProps<{ admins: string[] }>();
</script>

<style lang="scss" module></style>
