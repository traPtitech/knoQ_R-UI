<template>
  <div :class="$style.form">
    <TextInput
      placeholder="イベント名"
      v-model="event.name"
      :class="$style.eventName"
      :errs="err?.name?._errors"
    />
    <TagEditor v-model:tags="event.tags" />
    <PlaceTime v-model:placeTimes="event.placeTimes" />
    <TextArea v-model="event.description" placeholder="説明" />
    <GroupEdit
      :group="event.group"
      @update="(g) => (event.group = g)"
      :existingGroups="groups.myGroups"
    />
    <DetailEdit v-model:isOpen="event.open" v-model:admins="event.admins" />
    <!-- <button @click="submit">submit</button> -->
  </div>
</template>

<script setup lang="ts">
import TextInput from '/@/components/TextInput.vue'
import TagEditor from '/@/components/TagEditor.vue'
import PlaceTime from '/@/components/EventForm/PlaceTime.vue'
import TextArea from '/@/components/TextArea.vue'
import GroupEdit from '../components/EventForm/GroupEdit.vue'
import DetailEdit from '../components/EventForm/DetailEdit.vue'

import { EventForm, defaultValues, eventFormSchema } from '../models/eventForm'
import { ref, reactive, watch } from 'vue'
import { ZodFormattedError } from 'zod'
import { onMounted } from 'vue'
import { useGroupStore } from '../store/groups'
import { useMeStore } from '../store/me'

const event = reactive<EventForm>(defaultValues)
const err = ref<ZodFormattedError<EventForm>>()

watch(
  [event],
  (_old, _new) => {
    const result = eventFormSchema.safeParse(event)
    if (!result.success) {
      err.value = result.error.format()
    }
  },
  {
    immediate: true
  }
)

const me = useMeStore()
const groups = useGroupStore()
onMounted(async () => {
  await me.fetchMe()
  await groups.fetchGroups()
})
</script>

<style lang="scss" module>
.form {
  width: 80%;
  margin: 0 auto;

  > * {
    margin-bottom: 20px;
  }
}
.eventName {
  width: 100%;
}
</style>
