<template>
  <div>
    <span v-for="placeTime in placeTimes" :key="getKey(placeTime)">
      <span v-if="'place' in placeTime">a</span>
      <span v-if="!('place' in placeTime)">b</span>
    </span>
  </div>
  <div v-if="editing">
    <EventFormInput v-model="place" />
    <EventFormDateTimeInput v-model="timeStart" />
    <EventFormDateTimeInput v-model="timeEnd" />
    <button @click="emit('add', { place, timeStart, timeEnd })">追加</button>
  </div>
  <button v-else @click="onClick">+</button>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import EventFormDateTimeInput from "./EventFormDateTimeInput.vue";
import EventFormInput from "./EventFormInput.vue";

export interface PlaceTimeInstant {
  place: string;
  timeStart: Date;
  timeEnd: Date;
}
export interface PlaceTimeStock {
  roomId: string;
  timeStart: Date;
  timeEnd: Date;
}
export type PlaceTime = PlaceTimeInstant | PlaceTimeStock;

const props = defineProps<{
  placeTimes: PlaceTime[];
}>();
const emit = defineEmits<{
  (e: "add", newItem: PlaceStartEndTime): void;
  (e: "delete", deleteItem: PlaceStartEndTime): void;
}>();

const getKey = (placeTime: PlaceTimeInstant | PlaceTimeStock) => {
  if ("place" in placeTime) {
    return placeTime.place;
  } else {
    return placeTime.roomId;
  }
};

const editing = ref(false);
const onClick = () => (editing.value = true);

const place = ref("");
const timeStart = ref("");
const timeEnd = ref("");
</script>
<style></style>
