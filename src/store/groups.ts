import { defineStore } from 'pinia'
import api, { ResponseGroup } from '../api'
import { computed, ref } from 'vue'
import { useMeStore } from './me'

export const useGroupStore = defineStore('group', () => {
  const useMe = useMeStore()
  const groups = ref<ResponseGroup[]>([])
  const fetchGroups = async () => {
    const { data } = await api.groups.getGroups()
    groups.value = data
    console.log(groups.value)
  }
  const myGroups = computed(() => {
    if (useMe.me) {
      const _me = useMe.me
      return groups.value.filter(
        (group: ResponseGroup) =>
          group.members.includes(_me.userId) || group.admins.includes(_me.userId)
      )
    } else {
      return []
    }
  })
  return {
    groups,
    fetchGroups,
    myGroups
  }
})
