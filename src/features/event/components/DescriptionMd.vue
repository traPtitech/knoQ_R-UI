<script setup lang="ts">
import { Marked } from 'marked'
import { computed } from 'vue'

const props = defineProps<{ markdown: string }>()

const marked = new Marked()
const renderedMd = computed(() => marked.parse(props.markdown))
</script>

<template>
  <div v-html="renderedMd" />
</template>
