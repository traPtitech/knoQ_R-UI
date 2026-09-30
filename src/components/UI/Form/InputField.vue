<script setup lang="ts">
import {
  computed,
  useAttrs,
  useId,
  type HTMLAttributes,
  type StyleValue
} from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  label?: string
  id?: string
  error?: boolean | string
  hint?: string
  required?: boolean
}>()
const model = defineModel<string>()
const generatedId = useId()
const fieldId = computed(() => props.id ?? generatedId)
const attrs = useAttrs()
const wrapperClass = computed(() => attrs.class as HTMLAttributes['class'])
const wrapperStyle = computed(() => attrs.style as StyleValue)
const inputAttrs = computed(() => {
  const { class: c, style: s, ...rest } = attrs
  return rest
})
const describedBy = computed(
  () =>
    [
      attrs['aria-describedby'],
      props.hint ? `${fieldId.value}-hint` : undefined,
      typeof props.error === 'string' && props.error
        ? `${fieldId.value}-error`
        : undefined
    ]
      .filter(Boolean)
      .join(' ') || undefined
)
</script>

<template>
  <div class="grid min-w-0 gap-2" :class="wrapperClass" :style="wrapperStyle">
    <label :for="fieldId" class="grid gap-2">
      <span v-if="label" class="field-label">
        {{ label }}
        <span v-if="required" class="ml-2 field-required">※必須</span>
      </span>
      <span v-if="hint" :id="`${fieldId}-hint`" class="field-hint">{{
        hint
      }}</span>
      <input
        :id="fieldId"
        v-model="model"
        v-bind="inputAttrs"
        class="input-base"
        :required="required"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
      />
    </label>
    <p
      v-if="typeof error === 'string' && error"
      :id="`${fieldId}-error`"
      class="field-error"
    >
      {{ error }}
    </p>
  </div>
</template>
