<script setup lang="ts">
defineProps<{ label: string; id: string; hint?: string }>()
defineOptions({ inheritAttrs: false })
const model = defineModel<boolean>()
</script>

<template>
  <label class="min-h-12 flex cursor-pointer items-start gap-3 py-2" :for="id">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="mt-0.5 checkbox-base"
      v-bind="$attrs"
      :aria-describedby="hint ? `${id}-hint` : undefined"
    />
    <span>
      <span class="block text-base">{{ label }}</span>
      <span v-if="hint" :id="`${id}-hint`" class="mt-1 block field-hint">{{
        hint
      }}</span>
    </span>
  </label>
</template>
