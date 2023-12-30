import { ref } from 'vue'
import { client } from '../../../lib/api'

export const useTags = (eventID: string) => {
  const tags = ref([])
  const { GET, POST, DELETE } = client

  const getTags = async () => {
    // const {data: tags} = useApiSWRV("/t")
  }
  const addTag = async (tagName: string) => {
    await POST('/events/{eventID}/tags', {
      params: { path: { eventID } },
      body: { name: tagName }
    })
  }
  const deleteTag = async (tagName: string) => {
    await DELETE('/events/{eventID}/tags/{tagName}', {
      params: { path: { eventID, tagName } }
    })
  }

  return {
    tags,
    addTag,
    deleteTag
  }
}
