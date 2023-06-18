<template>
  <span :class="$style.date">{{ eventStart }}</span>
  <AIcon name="arrowRight" />
  <span :class="$style.date">{{ eventEnd }}</span>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import AIcon from '../UI/AIcon.vue'
import { computed } from 'vue'

const props = defineProps<{ time_start: string; time_end: string }>()
const formatDate = (date: string) => {
  return format(new Date(date), 'MM/dd (E) HH:mm', { locale: ja })
}
const eventStart = computed(() => formatDate(props.time_start))
const eventEnd = computed(() => formatDate(props.time_end))
</script>

<style lang="scss" module>
.date {
  @include size-h2;
  @include color-ui-primary;
}
</style>
