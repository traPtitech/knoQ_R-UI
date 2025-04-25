<script setup lang="ts">
import UserIcon from '/@/components/UI/UserIcon.vue'
</script>
<template>
  <div grid grid-justify-between grid-flow-col grid-items-center>
    <div>
      <p>100人が参加予定です</p>
      <div flex>
        <UserIcon userId="itt" w-6 h-6 mr--2 rounded-full />
        <UserIcon userId="itt" w-6 h-6 mr--2 rounded-full />
        <UserIcon userId="itt" w-6 h-6 mr--2 rounded-full />
        <UserIcon userId="itt" w-6 h-6 mr--2 rounded-full />
        <UserIcon userId="itt" w-6 h-6 mr--2 rounded-full />
      </div>
    </div>
    <div>
      <button>招待リンク</button>
    </div>
  </div>
</template>
