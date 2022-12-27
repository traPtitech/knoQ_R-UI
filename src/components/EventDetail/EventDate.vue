<template>
  <span :class="$style.date">{{ formatDate(props.time_start) }}</span>
  <AIcon name="arrowRight" />
  <span :class="$style.date">{{ formatDate(props.time_end) }}</span>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import AIcon from "../UI/AIcon.vue";

const props = defineProps<{ time_start: Date; time_end: Date }>();
const formatDate = (date: Date) => {
  return format(date, "MM/dd (E) HH:mm", { locale: ja });
};
</script>

<style lang="scss" module>
.date {
  @include size-h2;
  @include color-ui-primary;
}
</style>
