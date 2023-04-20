<template>
  <div :class="$style.element">
    <span v-if="placeTime.type === 'instant'"> {{ placeTime.place }} </span>
    <span v-if="placeTime.type === 'stock'"> {{ placeTime.roomId }} </span>
    :
    <span
      >{{ fmtDate(placeTime.timeStart) }} ~
      {{ fmtDate(placeTime.timeEnd) }}</span
    >
    <button @click="emit('delete')">削除</button>
  </div>
</template>

<script setup lang="ts">
import { PlaceTime } from "../../models/eventForm";
import { format } from "date-fns";
const props = defineProps<{
  placeTime: PlaceTime;
}>();
const emit = defineEmits<{
  (e: "delete"): void;
}>();

const fmtDate = (date: Date) => format(date, "HH:mm");
</script>

<style lang="scss" module>
.element {
  @include color-ui-primary;
  height: 36px;
  display: flex;
  align-items: center;
}
</style>
