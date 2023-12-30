<template>
  <div>
    <div :class="$style.elems">
      <div v-for="placeTime in placeTimes" :key="getKey(placeTime)">
        <PlaceTimeElement
          :place-time="placeTime"
          @delete="onDelete(placeTime)"
        />
      </div>
    </div>
    <div>
      <span v-if="placeType === 'instant'">
        <EventFormInput v-model="place" placeholder="instant" />
        <button @click="placeType = 'stock'">stockにする</button>
      </span>
      <span v-else>
        <EventFormInput v-model="roomId" placeholder="stock" />
        <button @click="placeType = 'instant'">instantにする</button>
      </span>
    </div>
    <EventFormDateTimeInput v-model="timeStart" />
    <EventFormDateTimeInput v-model="timeEnd" />
    <div>
      <button @click="onAdd">追加</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  PlaceTime,
  StockPlaceTime,
  InstantPlaceTime
} from '../../models/eventForm'
import EventFormDateTimeInput from './DateTimeInput.vue'
import EventFormInput from '../TextInput.vue'
import { ifExp } from '../../lib/if'
import PlaceTimeElement from './PlaceTimeElement.vue'

const props = defineProps<{
  placeTimes: PlaceTime[]
}>()

const emit = defineEmits<{
  (e: 'update:placeTimes', placeTimes: PlaceTime[]): void
}>()

const placeType = ref<'instant' | 'stock'>('instant')
const place = ref('')
const roomId = ref('')
const timeStart = ref('')
const timeEnd = ref('')

const getKey = (placeTime: PlaceTime) => {
  if ('place' in placeTime) {
    return placeTime.place
  } else {
    return placeTime.roomId
  }
}

const onAdd = () => {
  const newItem = ifExp<InstantPlaceTime, StockPlaceTime>(
    placeType.value === 'instant',
    {
      type: 'instant',
      place: place.value,
      timeStart: new Date(timeStart.value),
      timeEnd: new Date(timeEnd.value)
    },
    {
      type: 'stock',
      roomId: roomId.value,
      timeStart: new Date(timeStart.value),
      timeEnd: new Date(timeEnd.value)
    }
  )
  const newPlaceTimes = props.placeTimes
  newPlaceTimes.push(newItem)
  emit('update:placeTimes', newPlaceTimes)
  // place.value = "";
  // roomId.value = "";
  // timeStart.value = "";
  // timeEnd.value = "";
}
const onDelete = (placeTime: PlaceTime) => {
  const newPlaceTimes = props.placeTimes.filter(
    (item: PlaceTime) =>
      (item.type === 'instant' &&
        placeTime.type === 'instant' &&
        item.place !== placeTime.place) ||
      (item.type === 'stock' &&
        placeTime.type === 'stock' &&
        item.roomId !== placeTime.roomId) ||
      item.timeStart !== placeTime.timeStart ||
      item.timeEnd !== placeTime.timeEnd
  )
  emit('update:placeTimes', newPlaceTimes)
}
</script>
<style lang="scss" module>
.elems {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
