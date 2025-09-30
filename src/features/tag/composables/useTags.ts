import { ref } from 'vue'
import { apiClient } from '/@/lib/api'
import { Tag } from '..'

export const useTags = () => {
  const tags = ref<Tag[]>([])
  const { GET, POST, DELETE } = apiClient

  const getTags = async () => {
    const { data } = await GET('/tags')
    if (data) {
      tags.value = data
    }
  }
  const addTag = async (eventID: string, tagName: string) => {
    await POST('/events/{eventID}/tags', {
      params: { path: { eventID } },
      body: { name: tagName }
    })
  }
  const deleteTag = async (eventID: string, tagName: string) => {
    await DELETE('/events/{eventID}/tags/{tagName}', {
      params: { path: { eventID, tagName } }
    })
  }

  return {
    tags,
    getTags,
    addTag,
    deleteTag
  }
}
