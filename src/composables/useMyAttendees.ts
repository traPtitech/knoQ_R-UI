import { RequestScheduleScheduleEnum } from '../api/generated'
import { ref } from 'vue'

export const useMyAttendance = () => {
  const attendance = ref<RequestScheduleScheduleEnum | undefined>()
  const updateAttendance = () => {}

  return { attendance, updateAttendance }
}
