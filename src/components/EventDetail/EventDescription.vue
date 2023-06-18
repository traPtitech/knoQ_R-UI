<template>
  <div v-html="md.render(props.description)" />
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'
const props = defineProps<{ description: string }>()

const md = new MarkdownIt({
  breaks: true,
  linkify: true
})
</script>
<style lang="scss" module></style>
