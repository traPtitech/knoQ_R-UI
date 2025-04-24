<script setup lang="ts">
import DateTimeRangeField from './DateTimeRangeField.vue'
import CheckboxField from '/@/components/UI/Form/CheckboxField.vue'
</script>
<template>
  <div grid gap-2>
    <div grid gap-2>
      <p hxs>日時</p>
    </div>
    <CheckboxField label="日程調整する" />
    <DateTimeRangeField label="候補日1" />
    <DateTimeRangeField label="候補日2" />
  </div>
</template>
