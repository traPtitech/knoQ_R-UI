<script setup lang="ts">
import CheckboxField from '/@/components/UI/Form/CheckboxField.vue'
import InputField from '/@/components/UI/Form/InputField.vue'

defineProps<{ label: string }>()
</script>

<template>
  <div relative grid gap-2 rd-2 bg-surface-secondary p-3>
    <button
      i-material-symbols:close-rounded
      absolute
      right-2
      top-2
      h-5
      w-5
      p-2
    />
    <div>{{ label }}</div>
    <div grid grid-auto-cols-max grid-flow-col gap-4>
      <div grid grid-auto-cols-max grid-flow-col gap-2 grid-items-center>
        <p>開始</p>
        <!-- <InputField w-44 value="12月10日 (金曜日)" /> -->
        <!-- <InputField w-20 value="08:15" /> -->
      </div>
      <div grid grid-auto-cols-max grid-flow-col gap-2 grid-items-center>
        <p>終了</p>
        <!-- <InputField w-44 value="2月10日 (金曜日)" /> -->
        <!-- <InputField w-20 value="17:10" /> -->
      </div>
    </div>
    <!-- <CheckboxField label="終日" /> -->
  </div>
</template>
