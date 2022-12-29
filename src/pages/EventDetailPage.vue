<template>
  <div v-if="loadState === 'loading'">loading {{ eventId }}</div>
  <div v-else-if="loadState === 'error'">not found</div>
  <div v-else-if="event">
    <EventName :event_name="event.name" />
    <TagList :tags="tags" />

    <body :class="$style.section">
      日時
    </body>
    <EventDate :time_start="event.timeStart" :time_end="event.timeEnd" />

    <body :class="$style.section">
      場所
    </body>
    <EventPlace :place="event.place" />

    <body :class="$style.section">
      説明
    </body>
    <EventDescription :description="event.description" />

    <body :class="$style.section">
      グループ
    </body>
    <EventGroup :groupId="event.group.groupId" :groupName="event.group.name" />

    <body :class="$style.section">
      管理者
    </body>
    <EventAdmins :admins="admins!" />

    <div v-if="canAttend">
      <body :class="$style.section">
        自分の参加予定
      </body>
      <EventAttendanceMe
        :myAttendance="attendance"
        @change="onChangeMyAttendance"
      />
    </div>

    <body :class="$style.section">
      参加者
    </body>
    <EventAttendance :attendees="attendees!" />
  </div>
</template>

<script setup lang="ts">
import EventName from "../components/EventDetail/EventName.vue";
import EventDate from "../components/EventDetail/EventDate.vue";
import EventPlace from "../components/EventDetail/EventPlace.vue";
import { ResponseEventAttendeesInnerScheduleEnum } from "../api/generated";
import EventDescription from "../components/EventDetail/EventDescription.vue";
import EventGroup from "../components/EventDetail/EventGroup.vue";
import EventAdmins from "../components/EventDetail/EventAdmins.vue";
import EventAttendanceMe from "../components/EventDetail/EventAttendanceMe.vue";
import EventAttendance from "../components/EventDetail/EventAttendance.vue";
import { computed, onMounted } from "vue";
import TagList from "../components/EventDetail/Tag/TagList.vue";
import { useEvent } from "../composables/useEvent";
import { useRoute } from "vue-router";
import { getFirstParam } from "../lib/params";
import { useMyAttendance } from "../composables/useMyAttendees";
import { usersStore } from "../store/users";
import api from "../api";

const route = useRoute();
const eventId = computed(() => {
  return getFirstParam(route.params.id);
});
const { attendance, updateAttendance } = useMyAttendance();
const { event, loadState, fetchEvent, updateMyAttendance } = useEvent(
  eventId.value
);
const { getUser } = usersStore();
const tags = computed((): { id: string; name: string }[] =>
  event.value
    ? event.value.tags.map(({ tagId, name }) => {
        return { id: tagId, name: name };
      })
    : []
);
const canAttend = computed(() => true);
const admins = computed(() =>
  event.value?.admins.map((userId) => getUser(userId)?.name!)
);
const attendees = computed(() =>
  event.value?.attendees.map(({ userId, schedule }) => {
    return {
      name: getUser(userId)?.name!,
      schedule,
    };
  })
);
const onChangeMyAttendance = async (
  newState: ResponseEventAttendeesInnerScheduleEnum
) => {
  updateAttendance(newState);
  updateMyAttendance(newState);
  await api.events.updateEvent();
};
onMounted(async () => {
  await fetchEvent();
});
</script>

<style lang="scss" module>
.section {
  @include color-ui-secondary;
  font-size: 1rem;
}
</style>
