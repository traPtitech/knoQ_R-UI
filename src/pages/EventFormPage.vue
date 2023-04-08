<template>
  <div :class="$style.form">
    <EventFormInput placeholder="イベント名" v-model="event.name" />
    <TagEditor v-model:tags="event.tags" />
    <EventFormPlaceDateTime v-model:placeTimes="event.placeTimes" />
    <EventFormTextArea v-model="event.description" placeholder="説明" />
    <EventFormGroup :group="event.group" @update="(g) => (event.group = g)" />
    <EventFormDetail
      v-model:isOpen="event.open"
      v-model:admins="event.admins"
    />
    <!-- <button @click="submit">submit</button> -->
    {{ event }}
  </div>
</template>

<script setup lang="ts">
import EventFormDetail from "../components/EventForm/EventFormDetail.vue";
import EventFormPlaceDateTime from "../components/EventForm/EventFormPlaceTime.vue";
import EventFormInput from "../components/EventForm/EventFormInput.vue";
import EventFormTextArea from "../components/EventForm/EventFormTextArea.vue";
import EventFormGroup from "../components/EventForm/EventFormGroup.vue";
import TagEditor from "../components/UI/TagEditor.vue";
import { EventForm, defaultValues } from "../types/eventForm";
import { ref } from "vue";

const event = ref<EventForm>(defaultValues);
</script>

<style lang="scss" module>
.form {
  width: 80%;
  margin: 0 auto;

  > * {
    margin-bottom: 20px;
  }
}
</style>
