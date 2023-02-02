<template>
  <EventFormInput placeHolder="イベント名" />
  <TagEditor :tags="['hoge', 'fuga', 'aa']" />
  <EventFormTextArea placeHolder="説明" />
</template>

<script setup lang="ts">
import EventFormInput from "../components/EventForm/EventFormInput.vue";
import EventFormTextArea from "../components/EventForm/EventFormTextArea.vue";
import TagEditor from "../components/UI/TagEditor.vue";
</script>
