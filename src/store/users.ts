import { defineStore } from "pinia";
import api, { ResponseUser } from "../api";
import { ref } from "vue";

export const useUsersStore = defineStore("users", () => {
  const users = ref<Map<string, ResponseUser>>(new Map());
  const fetchUsers = async () => {
    if (users.value.size !== 0) {
      return;
    }
    try {
      const { data } = await api.users.getUsers(false);
      const tmp = new Map<string, ResponseUser>();
      data.forEach((user) => {
        tmp.set(user.userId, user);
      });
      users.value = tmp;
    } catch (e) {
      console.error(e);
    }
  };
  const getUser = async (userId: string) => {
    if (users.value.size === 0) {
      await fetchUsers();
    }
    return users.value.get(userId);
  };

  return {
    users,
    fetchUsers,
    getUser,
  };
});