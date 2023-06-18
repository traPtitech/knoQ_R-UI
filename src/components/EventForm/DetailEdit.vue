<template>
  <div>
    <EventFormCheckBox v-model="isOpenValue" text="グループ外の人は参加できないようにする" />
    <MembersEditor v-model="adminsValue" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MembersEditor from '../MembersEditor.vue'
import EventFormCheckBox from '../CheckBox.vue'
const props = defineProps<{
  isOpen: boolean
  admins: string[]
}>()
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'update:admins', value: string[]): void
}>()

const isOpenValue = computed({
  get: () => !props.isOpen,
  set: (v: boolean) => {
    emit('update:isOpen', !v)
  }
})

const adminsValue = computed({
  get: () => props.admins,
  set: (v) => {
    emit('update:admins', v)
  }
})
</script>
