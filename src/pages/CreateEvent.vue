<script lang="ts" setup>
import InputField from '/@/components/UI/Form/InputField.vue'
import AppHeader from '/@/components/AppHeader.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'

const model = defineModel<string>()
</script>
<template>
  <AppHeader />
  <div max-w-3xl mt-8 mx-auto grid gap-4>
    <h2 hl>イベントを作成する</h2>
    <div card grid gap-6>
      <h3 hm>基本情報</h3>
      <InputField label="イベント名" v-model="model" />
      <InputField label="連絡チャンネル" v-model="model" />
      <TextareaField label="イベント概要" />
    </div>
    <div card>
      <h3 hm>場所と日時</h3>
      <input />
    </div>
    <div card>
      <h3 hm>基本情報</h3>
      <input />
    </div>
  </div>
</template>
