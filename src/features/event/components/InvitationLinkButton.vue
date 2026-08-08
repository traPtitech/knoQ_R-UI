<script setup lang="ts">
import UserIcon from '/@/components/UI/UserIcon.vue'
</script>
<template>
  <div grid grid-flow-col grid-justify-between grid-items-center>
    <div>
      <p>100人が参加予定です</p>
      <div flex>
        <UserIcon user-id="itt" mr--2 h-6 w-6 rounded-full />
        <UserIcon user-id="itt" mr--2 h-6 w-6 rounded-full />
        <UserIcon user-id="itt" mr--2 h-6 w-6 rounded-full />
        <UserIcon user-id="itt" mr--2 h-6 w-6 rounded-full />
        <UserIcon user-id="itt" mr--2 h-6 w-6 rounded-full />
      </div>
    </div>
    <div>
      <button>招待リンク</button>
    </div>
  </div>
</template>
