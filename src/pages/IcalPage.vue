<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import DropdownMenu from '/@/components/UI/DropdownMenu.vue'
import { useTags } from '/@/features/tag/composables/useTags'
import { useEvents } from '/@/features/event/composables/useEvents'
import { useUsers } from '/@/features/user/composables/useUsers'
import { useGroups } from '/@/features/group/composables/useGroups'

const icalToken = ref('')
const eventFilter = ref('')
const dateBegin = ref('')
const dateEnd = ref('')

const isTagDropdownOpen = ref(false)
const isEventDropdownOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isGroupDropdownOpen = ref(false)

const tagDropdownRef = ref<HTMLElement | null>(null)
const eventDropdownRef = ref<HTMLElement | null>(null)
const userDropdownRef = ref<HTMLElement | null>(null)
const groupDropdownRef = ref<HTMLElement | null>(null)

const { tags, getTags } = useTags()
const { events, getEvents } = useEvents()
const { users } = useUsers()
const { groups, getGroups } = useGroups()

onMounted(() => {
  getTags()
  getEvents()
  getGroups()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  if (
    tagDropdownRef.value &&
    !tagDropdownRef.value.contains(event.target as Node) &&
    eventDropdownRef.value &&
    !eventDropdownRef.value.contains(event.target as Node) &&
    userDropdownRef.value &&
    !userDropdownRef.value.contains(event.target as Node) &&
    groupDropdownRef.value &&
    !groupDropdownRef.value.contains(event.target as Node)
  ) {
    isTagDropdownOpen.value = false
    isEventDropdownOpen.value = false
    isUserDropdownOpen.value = false
    isGroupDropdownOpen.value = false
  }
}

const icalUrl = computed(() => {
  if (icalToken.value) {
    let url = `${window.location.origin}/api/ical/v1/${icalToken.value}`
    const params = []

    if (eventFilter.value) {
      params.push(`q=${encodeURIComponent(eventFilter.value)}`)
    }
    if (dateBegin.value) {
      params.push(`dateBegin=${new Date(dateBegin.value).toISOString()}`)
    }
    if (dateEnd.value) {
      params.push(`dateEnd=${new Date(dateEnd.value).toISOString()}`)
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    return url
  }
  return ''
})

const copyToClipboard = async () => {
  if (icalUrl.value) {
    await navigator.clipboard.writeText(icalUrl.value)
    alert('iCal URL copied to clipboard!')
  }
}

const appendFilter = (filter: string) => {
  if (eventFilter.value) {
    eventFilter.value += ` || ${filter}`
  } else {
    eventFilter.value = filter
  }
}

const clearFilter = () => {
  eventFilter.value = ''
}

const selectTag = (tag: { id: string; name: string }) => {
  appendFilter(`tag==${tag.id}`)
  isTagDropdownOpen.value = false
}

const selectEvent = (event: { id: string; name: string }) => {
  appendFilter(`event==${event.id}`)
  isEventDropdownOpen.value = false
}

const selectUser = (user: { id: string; name: string }) => {
  appendFilter(`user==${user.id}`)
  isUserDropdownOpen.value = false
}

const selectGroup = (group: { id: string; name: string }) => {
  appendFilter(`group==${group.id}`)
  isGroupDropdownOpen.value = false
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Generate iCal URL</h1>
    <div class="space-y-4">
      <InputField
        v-model="icalToken"
        label="iCal Token"
        placeholder="Enter your iCal token"
      />
      <TextareaField
        v-model="eventFilter"
        label="Event Filter (q)"
        placeholder="e.g., event==UUID || user==UUID"
      />
      <div class="text-sm text-gray-600">
        <p>Syntax: <code>top : ε | expr</code></p>
        <p><code>expr : term ( ( "||" | "&&" ) term)*</code></p>
        <p><code>term : cmp | "(" expr ")"</code></p>
        <p><code>cmp : Attr ( "==" | "!=" ) UUID</code></p>
        <p><code>Attr : "event" | "user" | "group" | "tag"</code></p>
        <p>
          Example:
          <code
            >event==xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx ||
            tag==yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy</code
          >
        </p>
      </div>

      <div class="flex space-x-2">
        <DropdownMenu ref="tagDropdownRef" v-model:is-open="isTagDropdownOpen">
          <template #trigger>
            <PrimaryButton>Add Tag Filter</PrimaryButton>
          </template>
          <div class="py-1">
            <a
              v-for="tag in tags"
              :key="tag.tagId"
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click.prevent.stop="selectTag({ id: tag.tagId, name: tag.name })"
            >
              {{ tag.name }}
            </a>
          </div>
        </DropdownMenu>

        <DropdownMenu
          ref="eventDropdownRef"
          v-model:is-open="isEventDropdownOpen"
        >
          <template #trigger>
            <PrimaryButton>Add Event Filter</PrimaryButton>
          </template>
          <div class="py-1 max-h-60 overflow-y-auto">
            <a
              v-for="event in events"
              :key="event.eventId"
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click.prevent.stop="
                selectEvent({ id: event.eventId, name: event.name })
              "
            >
              {{ event.name }}
            </a>
          </div>
        </DropdownMenu>

        <DropdownMenu
          ref="userDropdownRef"
          v-model:is-open="isUserDropdownOpen"
        >
          <template #trigger>
            <PrimaryButton>Add User Filter</PrimaryButton>
          </template>
          <div class="py-1 max-h-60 overflow-y-auto">
            <a
              v-for="user in users"
              :key="user.userId"
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click.prevent.stop="
                selectUser({ id: user.userId, name: user.name })
              "
            >
              {{ user.name }}
            </a>
          </div>
        </DropdownMenu>

        <DropdownMenu
          ref="groupDropdownRef"
          v-model:is-open="isGroupDropdownOpen"
        >
          <template #trigger>
            <PrimaryButton>Add Group Filter</PrimaryButton>
          </template>
          <div class="py-1 max-h-60 overflow-y-auto">
            <a
              v-for="group in groups"
              :key="group.groupId"
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click.prevent.stop="
                selectGroup({ id: group.groupId, name: group.name })
              "
            >
              {{ group.name }}
            </a>
          </div>
        </DropdownMenu>

        <PrimaryButton @click="clearFilter">Clear Filter</PrimaryButton>
      </div>

      <InputField
        v-model="dateBegin"
        label="Date Begin"
        type="datetime-local"
      />
      <InputField v-model="dateEnd" label="Date End" type="datetime-local" />

      <PrimaryButton :disabled="!icalUrl" @click="copyToClipboard">
        Copy iCal URL
      </PrimaryButton>
      <div v-if="icalUrl" class="bg-gray-100 p-4 rounded break-all">
        <p class="font-mono text-sm">{{ icalUrl }}</p>
      </div>
    </div>
  </div>
</template>
