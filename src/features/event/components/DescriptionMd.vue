<script setup lang="ts">
import { Marked } from 'marked'
import { computed } from 'vue'

const props = defineProps<{ markdown: string }>()

const marked = new Marked()
const renderedMd = computed(() => marked.parse(props.markdown))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- Event descriptions are stored as Markdown and rendered as HTML. -->
  <div v-html="renderedMd" />
</template>
