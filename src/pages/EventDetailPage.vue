<template>
  <div v-if="loadState === 'loading'">loading</div>
  <div v-else-if="loadState === 'error'">not found</div>
  <div v-else>
    <EventName :event_name="event.name" />
    <TagList :tags="tags" />
    <EventDetailElement title="日時">
      <EventDate :time_start="event.timeStart" :time_end="event.timeEnd" />
    </EventDetailElement>
    <EventDetailElement title="場所">
      <EventPlace :place="event.place" />
    </EventDetailElement>
    <EventDetailElement title="説明">
      <EventDescription :description="event.description" />
    </EventDetailElement>
    <EventDetailElement title="グループ">
      <EventGroup
        :groupId="event.group.groupId"
        :groupName="event.group.name"
      />
    </EventDetailElement>
    <EventDetailElement title="管理者">
      <EventAdmins :admins="admins" />
    </EventDetailElement>
    <div v-if="canAttend">
      <EventDetailElement title="自分の参加予定">
        <EventAttendanceMe
          :myAttendance="myAttendance"
          @change="onChangeMyAttendance"
        />
      </EventDetailElement>
    </div>
    <EventDetailElement title="参加者">
      <EventAttendance v-if="attendees" :attendees="attendees" />
    </EventDetailElement>
  </div>
</template>

<script setup lang="ts">
import EventName from "../components/EventDetail/EventName.vue";
import EventDate from "../components/EventDetail/EventDate.vue";
import EventPlace from "../components/EventDetail/EventPlace.vue";
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
import { useUsersStore } from "../store/users";
import EventDetailElement from "../components/EventDetail/EventDetailElement.vue";
import { AttendanceState } from "../types";
import { useMeStore } from "../store/me";

const route = useRoute();
const eventId = computed(() => {
  return getFirstParam(route.params.id);
});
const {
  event: _event,
  loadState,
  fetchEvent,
  updateMyAttendance,
} = useEvent(eventId.value);
const event = computed(() => _event.value!);
const useUsers = useUsersStore();
useUsers.fetchUsers();
const meStore = useMeStore();

const tags = computed((): { id: string; name: string }[] =>
  event.value
    ? event.value.tags.map(({ tagId, name }) => {
        return { id: tagId, name: name };
      })
    : []
);
const canAttend = computed(() => true);
const admins = computed(() =>
  event.value.admins
    .map((userId) => useUsers.users.get(userId))
    .filter((item) => item !== undefined)
    .map((item) => item?.name!)
);
const attendees = computed(() =>
  event.value.attendees
    .map(({ userId, schedule }) => {
      return {
        name: useUsers.users.get(userId)?.name,
        schedule,
      };
    })
    .filter((item) => item.name !== undefined)
    .map(({ name, schedule }) => {
      return { name: name!, schedule };
    })
);
const myAttendance = computed(
  () =>
    event.value.attendees.find(({ userId }) => userId === meStore.me?.userId)
      ?.schedule
);
const onChangeMyAttendance = async (newState: AttendanceState) => {
  updateMyAttendance(newState);
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
