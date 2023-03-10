<template>
  <div>
    <div v-for="placeTime in placeTimes" :key="getKey(placeTime)">
      {{ placeTime }}
      <button @click="emit('delete', placeTime)">削除</button>
    </div>
  </div>
  <div v-if="editing">
    <span v-if="placeType === 'instant'">
      <EventFormInput v-model="place" placeholder="instant" />
      <button @click="placeType = 'stock'">stockにする</button>
    </span>
    <span v-else>
      <EventFormInput v-model="roomId" placeholder="stock" />
      <button @click="placeType = 'instant'">instantにする</button>
    </span>
    <EventFormDateTimeInput v-model="timeStart" />
    <EventFormDateTimeInput v-model="timeEnd" />
    <button @click="onAddPlaceTime">追加</button>
  </div>
  <button v-else @click="editing = true">+</button>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {
  InstantPlaceTime,
  StockPlaceTime,
} from "../../composables/useEventForm";
import EventFormDateTimeInput from "./EventFormDateTimeInput.vue";
import EventFormInput from "./EventFormInput.vue";

type PlaceTime = InstantPlaceTime | StockPlaceTime;

const props = defineProps<{
  placeTimes: PlaceTime[];
}>();

const emit = defineEmits<{
  (e: "add", newItem: PlaceTime): void;
  (e: "delete", deleteItem: PlaceTime): void;
  (e: "edit", oldValue: PlaceTime, newValue: PlaceTime): void;
}>();

const editing = ref(false);

const placeType = ref<"instant" | "stock">("instant");

const place = ref("");
const roomId = ref("");
const timeStart = ref("");
const timeEnd = ref("");

const getKey = (placeTime: PlaceTime) => {
  if ("place" in placeTime) {
    return placeTime.place;
  } else {
    return placeTime.roomId;
  }
};

const toDate = (date: string) => Date.parse(date);

const onAddPlaceTime = () => {
  if (placeType.value === "instant") {
    emit("add", {
      place: place.value,
      timeStart: new Date(timeStart.value),
      timeEnd: new Date(timeEnd.value),
    });
  } else {
    emit("add", {
      roomId: roomId.value,
      timeStart: new Date(timeStart.value),
      timeEnd: new Date(timeEnd.value),
    });
  }
  place.value = "";
  roomId.value = "";
  timeStart.value = "";
  timeEnd.value = "";
};
</script>
<style></style>
