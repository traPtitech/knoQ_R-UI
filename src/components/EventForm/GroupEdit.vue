<template>
  <div></div>
  <EventFormGroupFrame
    :open="groupType === 'stock'"
    @click="groupType = 'stock'"
    title="既存のグループで開催"
  >
    <div>
      <DropDownSelector v-model="groupId" :options="groupOptions" />
    </div>
  </EventFormGroupFrame>
  <EventFormGroupFrame
    :open="groupType === 'instant'"
    @click="groupType = 'instant'"
    title="新規のグループで開催"
  >
    <div :class="$style.instantGroup">
      <EventFormInput v-model="groupName" placeholder="グループ名" :class="$style.input" />
      <EventFormInput v-model="description" placeholder="説明" :class="$style.input" />
      <EventFormCheckBox v-model="open" text="自由に出入りできるようにする" />
      <MembersEditor v-model="admins" :class="$style.input" />
      <MembersEditor v-model="members" :class="$style.input" />
    </div>
  </EventFormGroupFrame>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import EventFormInput from '../TextInput.vue'
import MembersEditor from '../MembersEditor.vue'
import EventFormGroupFrame from './GroupFrame.vue'
import { Group } from '../../models/eventForm'
import EventFormCheckBox from '../CheckBox.vue'
import { ResponseGroup } from '../../api'
import DropDownSelector from '../DropDownSelector.vue'

const props = defineProps<{
  group: Group
  existingGroups: ResponseGroup[]
}>()
const emit = defineEmits<{
  (e: 'update', value: Group): void
}>()

const groupType = ref<'instant' | 'stock'>('stock')

const groupId = ref('')

const groupName = ref('')
const description = ref('')
const open = ref(false)
const admins = ref<string[]>([])
const members = ref<string[]>([])

const onUpdate = () => {
  if (groupType.value === 'instant') {
    emit('update', {
      name: groupName.value,
      description: description.value,
      open: open.value,
      admins: admins.value,
      members: members.value
    })
  } else {
    emit('update', {
      groupId: groupId.value
    })
  }
}

const groupOptions = computed(() =>
  props.existingGroups.map((group) => {
    return {
      name: group.name,
      value: group.groupId
    }
  })
)

watch([groupType, groupId, groupName, description, open, admins, members], onUpdate, {
  immediate: true
})
</script>

<style lang="scss" module>
.input {
  width: 100%;
}
.instantGroup {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
