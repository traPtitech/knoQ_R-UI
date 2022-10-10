import { defineStore } from "pinia";
import api, { ResponseUser } from "../api";
import { ref } from "vue";

export const meStore = defineStore("me", () => {
  const me = ref<ResponseUser | undefined>(undefined);
  const fetchMe = async () => {
    try {
      const { data } = await api.users.getMe();
      me.value = data;
      return data;
    } catch {
      me.value = undefined;
      return undefined;
    }
  };
  return {
    me,
    fetchMe,
  };
});
