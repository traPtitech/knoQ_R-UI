<script setup lang="ts">
import InputField from './InputField.vue'
</script>

<template>
  <div grid grid-cols="[1fr_auto]" grid-items-center gap-2>
    <InputField />
    <button w-5 h-5 p-2 i-material-symbols:close-rounded />
  </div>
</template>
