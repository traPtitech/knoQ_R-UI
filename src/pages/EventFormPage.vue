<template>
  <EventFormInput placeholder="イベント名" v-model="event.name" />
  <TagEditor
    :tags="validTags"
    @delete="deleteTag"
    @add="addTag"
    @lock="lockTag"
  />
  <EventFormPlaceDateTime :placeTimes="event.placeTimes" @add="addPlaceTime" />
  <EventFormTextArea v-model="event.description" placeholder="説明" />
  <!-- <EventFormGroup /> -->
  <EventFormDetail />
  <button @click="submit">submit</button>
  {{ event }}
</template>

<script setup lang="ts">
import EventFormDetail from "../components/EventForm/EventFormDetail.vue";
import EventFormPlaceDateTime from "../components/EventForm/EventFormPlaceTime.vue";
import EventFormInput from "../components/EventForm/EventFormInput.vue";
import EventFormTextArea from "../components/EventForm/EventFormTextArea.vue";
import TagEditor from "../components/UI/TagEditor.vue";
import { useEventForm } from "../composables/useEventForm";

const {
  event,
  validTags,
  addTag,
  deleteTag,
  lockTag,
  addPlaceTime,
  deletePlaceTime,
  editPlaceTime,
} = useEventForm();
</script>
