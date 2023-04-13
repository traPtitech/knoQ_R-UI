<template>
  <EventFormGroupFrame
    :open="groupType === 'stock'"
    @click="groupType = 'stock'"
    title="既存のグループで開催"
  >
    <div>
      <EventFormInput v-model="groupId" placeholder="グループ名" />
    </div>
  </EventFormGroupFrame>
  <EventFormGroupFrame
    :open="groupType === 'instant'"
    @click="groupType = 'instant'"
    title="新規のグループで開催"
  >
    <div>
      <div>
        <EventFormInput v-model="groupName" placeholder="グループ名" />
      </div>
      <div>
        <EventFormInput v-model="description" placeholder="説明" />
      </div>
      <div>
        <MembersEditor v-model="admins" />
      </div>
      <div>
        <MembersEditor v-model="members" />
      </div>
    </div>
  </EventFormGroupFrame>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import EventFormInput from "./EventFormInput.vue";
import MembersEditor from "../UI/MembersEditor.vue";
import EventFormGroupFrame from "./EventFormGroupFrame.vue";
import { Group } from "../../types/eventForm";

const props = defineProps<{
  group: Group;
}>();
const emit = defineEmits<{
  (e: "update", value: Group): void;
}>();

const groupType = ref<"instant" | "stock">("stock");

const groupId = ref("");

const groupName = ref("");
const description = ref("");
const open = ref(false);
const admins = ref<string[]>([]);
const members = ref<string[]>([]);

const onUpdate = () => {
  console.log("updated");
  if (groupType.value === "instant") {
    emit("update", {
      name: groupName.value,
      description: description.value,
      open: open.value,
      admins: admins.value,
      members: members.value,
    });
  } else {
    emit("update", {
      groupId: groupId.value,
    });
  }
};

watch(
  [groupType, groupId, groupName, description, open, admins, members],
  onUpdate,
  {
    immediate: true,
  }
);
</script>
