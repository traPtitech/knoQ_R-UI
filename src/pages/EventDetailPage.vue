<template>
  <event-name :event_name="test_event.name" />
  <tags />
  <div :class="$style.hoge">日時</div>
  <event-date
    :time_start="test_event.timeStart"
    :time_end="test_event.timeEnd"
  />
  <div :class="$style.hoge">場所</div>
  <event-place :place="test_event.place" />
  <h2>説明</h2>
  <event-description :description="test_event.description" />
  <h2>グループ</h2>
  <event-group :group="test_event.group" />
  <h2>管理者</h2>
  <event-admins :admins="test_event.admins" />
  <h2>自分の参加予定</h2>
  <event-attendance-me
    :myAttendance="myAttendance!"
    @change="onChangeMyAttendance"
  />
  <h2>参加者</h2>
  <event-attendance :attendees="test_event.attendees" />
</template>

<script setup lang="ts">
import EventName from "../components/EventDetail/EventName.vue";
import EventDate from "../components/EventDetail/EventDate.vue";
import EventPlace from "../components/EventDetail/EventPlace.vue";
import {
  RequestScheduleScheduleEnum,
  ResponseEventDetail,
} from "../api/generated";
import EventDescription from "../components/EventDetail/EventDescription.vue";
import EventGroup from "../components/EventDetail/EventGroup.vue";
import EventAdmins from "../components/EventDetail/EventAdmins.vue";
import EventAttendanceMe from "../components/EventDetail/EventAttendanceMe.vue";
import EventAttendance from "../components/EventDetail/EventAttendance.vue";
import { computed, ref } from "vue";
import { meStore } from "../store/me";
import api from "../api";

const event = ref<ResponseEventDetail | null>(null);
const { me } = meStore();

const myAttendance = computed(() => {
  if (!event.value) {
    return null;
  }
  return event.value.attendees.find(({ userId }) => userId === me?.userId)
    ?.schedule;
});

const onChangeMyAttendance = async (
  attendance: RequestScheduleScheduleEnum
) => {
  try {
    if (!event.value) {
      return;
    }
    await api.events.updateSchedule(event.value.eventId, {
      schedule: attendance,
    });
    const { data } = await api.events.getEventDetail(event.value.eventId);
    event.value = data;
  } catch (err) {
    console.error(err);
    alert("参加予定を登録できませんでした");
  }
};

const test_event: ResponseEventDetail = {
  eventId: "ba83e5ad-49fe-4e2a-b112-221bb879784a",
  name: "第63回　knoQ meeting",
  description:
    "https://md.trap.jp/zwSg2MMTQ3SYkPwkL10XzA\n\n## 予定\n- 20:30 ~ 21:00 集会\n- 21:00 ~ 23:00 進捗会\n",
  room: {
    roomId: "a5f8d861-e173-474f-a389-bc6eb705e86a",
    verified: false,
    place: "discord team/knoQ",
    timeStart: "2022-09-17T20:30:00+09:00",
    timeEnd: "2022-09-17T23:00:00+09:00",
    admins: ["48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4"],
    freeTimes: [],
    sharedTimes: [],
    createdBy: "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
    createdAt: "2022-09-17T19:58:59+09:00",
    updatedAt: "2022-09-17T19:58:59+09:00",
  },
  group: {
    groupId: "27b26412-67e2-449d-9cba-c4b543771407",
    name: "SysAd knoQ",
    description: "knoQ 開発グループ",
    open: false,
    members: [
      "18984a38-4dc7-41ab-9c8d-f5469a8e30a9",
      "36ece538-f7c1-4a37-871d-65ca4937444f",
      "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
      "4dc6e211-2b73-490b-8610-f10bcf453a09",
      "7b971e0b-8dc5-42af-b1fb-fa9cc9824b03",
      "c7f4a497-890e-4a8e-bc05-d15ac5828c88",
      "e47f684f-c073-4c77-ac78-87abf0c4074d",
      "f3e59b3c-aee7-43b7-8df1-6f5979618454",
      "fe3d412c-a92e-459d-beff-29015a6cdef9",
    ],
    admins: [
      "18984a38-4dc7-41ab-9c8d-f5469a8e30a9",
      "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
      "f3e59b3c-aee7-43b7-8df1-6f5979618454",
    ],
    isTraQGroup: false,
    createdBy: "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
    createdAt: "2020-04-12T10:24:57+09:00",
    updatedAt: "2022-06-20T18:08:37+09:00",
  },
  place: "discord team/knoQ",
  groupName: "SysAd knoQ",
  timeStart: "2022-09-17T20:30:00+09:00",
  timeEnd: "2022-09-17T23:00:00+09:00",
  createdBy: "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
  admins: [
    "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
    "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4",
  ],
  tags: [
    {
      tagId: "faa36ad8-4029-433e-864f-406c7151766d",
      name: "room",
      locked: false,
    },
  ],
  sharedRoom: false,
  open: false,
  attendees: [
    { userId: "18984a38-4dc7-41ab-9c8d-f5469a8e30a9", schedule: "pending" },
    { userId: "36ece538-f7c1-4a37-871d-65ca4937444f", schedule: "absent" },
    { userId: "48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4", schedule: "attendance" },
    { userId: "4dc6e211-2b73-490b-8610-f10bcf453a09", schedule: "pending" },
    { userId: "7b971e0b-8dc5-42af-b1fb-fa9cc9824b03", schedule: "pending" },
    { userId: "c7f4a497-890e-4a8e-bc05-d15ac5828c88", schedule: "pending" },
    { userId: "e47f684f-c073-4c77-ac78-87abf0c4074d", schedule: "pending" },
    { userId: "f3e59b3c-aee7-43b7-8df1-6f5979618454", schedule: "pending" },
    { userId: "fe3d412c-a92e-459d-beff-29015a6cdef9", schedule: "pending" },
  ],
  createdAt: "2022-09-17T19:58:59+09:00",
  updatedAt: "2022-09-17T19:58:59+09:00",
};
</script>

<style lang="scss" module>
.hoge {
  color: #8a9899;
  font-size: 16pt;
}
</style>
