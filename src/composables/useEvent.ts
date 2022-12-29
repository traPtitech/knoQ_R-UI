import { ref } from "vue";
import api, { ResponseEventDetail } from "../api";
import { loadingState } from "../types";

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
  const updateMyAttendance = () => {
    if (event.value) {
      return;
    }
  };

  return {
    event,
    loadState,
    fetchEvent,
    updateMyAttendance,
  };
};
