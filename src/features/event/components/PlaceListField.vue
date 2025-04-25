<script setup lang="ts">
import { ref } from 'vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import DeletableInputField from '/@/components/UI/Form/DeletableInputField.vue'

const placeList = ref([])
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
