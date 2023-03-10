<template>
  <div v-if="groupType === 'stock'">
    <button @click="groupType = 'instant'">新規グループで開催に変更</button>
    <div>
      <span>既存のグループで開催</span>
    </div>
    <div>
      <EventFormInput v-model="groupId" placeholder="グループ名" />
      <!-- <DropDown :source="groups" v-model="" /> -->
    </div>
  </div>
  <div v-else>
    <button @click="groupType = 'stock'">既存グループで開催に変更</button>
    <div>
      <span>新規のグループで開催</span>
    </div>
    <div>
      <div>
        <EventFormInput v-bind="groupName" placeholder="グループ名" />
      </div>
      <div>
        <EventFormInput v-bind="description" placeholder="説明" />
      </div>
      <div>
        <MembersEditor />
      </div>
      <div>
        <MembersEditor />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EventFormInput from "./EventFormInput.vue";
import MembersEditor from "../UI/MembersEditor.vue";

const props = defineProps<{}>();
const groupType = ref<"instant" | "stock">("stock");

const groupId = ref("");

const groupName = ref("");
const description = ref("");
const admins = ref([]);
const members = ref([]);
</script>
