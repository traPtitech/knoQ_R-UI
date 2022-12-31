<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import { useMeStore } from "../store/me";
const meStore = useMeStore();
onMounted(async () => await meStore.fetchMe());
</script>

<template>
  <img alt="Vue logo" src="../assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
  <RouterLink to="/events/62a569a2-74d6-474e-80d0-9a6bcdd58050"
    >event</RouterLink
  >
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
