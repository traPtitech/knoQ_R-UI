<script setup lang="ts">
import { computed, useAttrs } from 'vue'
const props = defineProps<{
  label: string
  id: string
  hint?: string
  error?: string
  required?: boolean
}>()
defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
const attrs = useAttrs()
const describedBy = computed(
  () =>
    [
      attrs['aria-describedby'],
      props.hint ? `${props.id}-hint` : undefined,
      props.error ? `${props.id}-error` : undefined
    ]
      .filter(Boolean)
      .join(' ') || undefined
)
</script>

<template>
  <div class="grid gap-2">
    <label :for="id" class="grid gap-2">
      <span class="field-label"
        >{{ label }}
        <span v-if="required" class="ml-2 field-required">※必須</span></span
      >
      <span v-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</span>
      <textarea
        :id="id"
        v-model="model"
        class="input-base resize-y"
        v-bind="$attrs"
        :required="required"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
      />
    </label>
    <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
  </div>
</template>
