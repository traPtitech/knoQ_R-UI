<template>
  <div>
    <span v-for="member in members" :key="member">
      <div>
        {{ member }}
        <button @click="onDeleteMember(member)">削除</button>
      </div>
    </span>
    <input v-model="editingValue" />
    <button @click="onAddMember">追加</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{
  placeholder?: string;
  modelValue: string[];
}>();
const emit = defineEmits<{
  (e: "update:modelValue", members: string[]): void;
}>();

const members = ref<string[]>([]);
const editingValue = ref("");

const onAddMember = (e: Event) => {
  members.value.push(editingValue.value);
  editingValue.value = "";
  emit("update:modelValue", members.value);
};
const onDeleteMember = (member: string) => {
  members.value = members.value.filter((item) => item !== member);
  emit("update:modelValue", members.value);
};
</script>
