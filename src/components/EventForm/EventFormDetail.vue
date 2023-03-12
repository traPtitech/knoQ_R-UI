<template>
  <div>
    <CheckBox v-model="isOpenValue" />
    <span>グループ外の人は参加できないようにする</span>
    <MembersEditor v-model="adminsValue" />
  </div>
</template>

<script setup lang="ts">
import EventFormInput from "./EventFormInput.vue";
import CheckBox from "../../components/UI/CheckBox.vue";
import { ref, computed } from "vue";
import MembersEditor from "../UI/MembersEditor.vue";
const props = defineProps<{
  isOpen: boolean;
  admins: string[];
}>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "update:admins", value: string[]): void;
}>();

const isOpenValue = computed({
  get() {
    return !props.isOpen;
  },
  set(v) {
    emit("update:isOpen", !v);
  },
});

const adminsValue = computed({
  get() {
    return props.admins;
  },
  set(v) {
    emit("update:admins", v);
  },
});
</script>
