import { ref } from "vue";
import api, { ResponseEventDetail } from "../api";
import { useMeStore } from "../store/me";
import { AttendanceState, loadingState } from "../types";

export const useEvent = (eventId: string) => {
  const event = ref<ResponseEventDetail | null>(null);
  const loadState = ref<loadingState>("loading");
  const fetchEvent = async () => {
    try {
      const { data } = await api.events.getEventDetail(eventId);
      loadState.value = "loaded";
      event.value = data;
    } catch (e) {
      console.error(e);
      event.value = null;
      loadState.value = "error";
    }
  };
  const useMe = useMeStore();
  const updateMyAttendance = (newState: AttendanceState) => {
    if (useMe.me) {
      if (event.value) {
        const myIdx = event.value.attendees.findIndex(
          ({ userId }) => userId === useMe.me?.userId
        );
        if (myIdx >= 0) {
          event.value.attendees[myIdx].schedule = newState;
          api.events.updateSchedule(eventId, { schedule: newState });
        } else {
          event.value.attendees.push({
            userId: useMe.me?.userId,
            schedule: newState,
          });
        }
      }
    }
  };

  return {
    event,
    loadState,
    fetchEvent,
    updateMyAttendance,
  };
};
