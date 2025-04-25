<script setup lang="ts">
import CheckboxField from '/@/components/UI/Form/CheckboxField.vue'
import InputField from '/@/components/UI/Form/InputField.vue'

defineProps<{ label: string }>()
</script>

<template>
  <div relative bg-surface-secondary rd-2 p-3 grid gap-2>
    <button
      absolute
      right-2
      top-2
      w-5
      h-5
      p-2
      i-material-symbols:close-rounded
    />
    <div>{{ label }}</div>
    <div grid grid-flow-col grid-auto-cols-max gap-4>
      <div grid grid-flow-col grid-auto-cols-max grid-items-center gap-2>
        <p>開始</p>
        <InputField w-44 value="12月10日 (金曜日)" />
        <InputField w-20 value="08:15" />
      </div>
      <div grid grid-flow-col grid-auto-cols-max grid-items-center gap-2>
        <p>終了</p>
        <InputField w-44 value="2月10日 (金曜日)" />
        <InputField w-20 value="17:10" />
      </div>
    </div>
    <CheckboxField label="終日" />
  </div>
</template>
