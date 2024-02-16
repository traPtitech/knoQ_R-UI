<template>
<label>
    {{ label }}
    <input v-model="modelValue" type="datetime-local"/>
</label>
</template>
<script setup lang="ts">
defineProps<{
    label: string
}>()
const modelValue = defineModel<Date>()
</script>