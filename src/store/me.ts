import { defineStore } from "pinia";
import api, { ResponseUser } from "../api";
import { ref } from "vue";

export const useMeStore = defineStore("me", () => {
  const me = ref<ResponseUser | null>(null);
  const fetchMe = async () => {
    if (!me.value) {
      try {
        const { data } = await api.users.getMe();
        me.value = data;
        console.log(me.value);
      } catch (e) {
        me.value = null;
        console.error(e);
      }
    }
  };
  return {
    me,
    fetchMe,
  };
});
