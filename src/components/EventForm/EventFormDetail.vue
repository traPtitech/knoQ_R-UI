<template>
  <div>
    <CheckBox v-model="value" />
    <span>グループ外の人は参加できないようにする</span>
  </div>
</template>

<script setup lang="ts">
import EventFormInput from "./EventFormInput.vue";
import CheckBox from "../../components/UI/CheckBox.vue";
import { ref, computed } from "vue";
const props = defineProps<{
  isOpen: boolean;
}>();
const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
}>();

const value = computed({
  get() {
    return !props.isOpen;
  },
  set(v) {
    emit("update:isOpen", !v);
  },
});
</script>
