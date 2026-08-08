<script setup lang="ts">
import DeletableInputField from '/@/components/UI/Form/DeletableInputField.vue'
</script>

<template>
  <div grid gap-2>
    <div grid gap-2>
      <p hxs>場所</p>
      <p cap-m>例) S2-201, Discord</p>
    </div>
    <DeletableInputField />
    <DeletableInputField />
    <DeletableInputField />
  </div>
</template>
