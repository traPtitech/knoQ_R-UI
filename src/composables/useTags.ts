import { RequestScheduleScheduleEnum } from "../api/generated";
import { ref } from "vue";

export const useMyAttendance = () => {
  const attendance = ref<RequestScheduleScheduleEnum | null>(null);

  return { attendance };
};
