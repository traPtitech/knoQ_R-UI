<script lang="ts" setup>
import InputField from '/@/components/UI/Form/InputField.vue'
import AppHeader from '/@/components/AppHeader.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PlaceListField from '../features/event/components/PlaceListField.vue'
import PrimaryButton from '../components/UI/Button/PrimaryButton.vue'
import DateListField from '../features/event/components/DateListField.vue'

const model = defineModel<string>()
</script>
<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-4>
    <h2 hl>イベントを作成する</h2>
    <div card grid gap-6>
      <h3 hm>基本情報</h3>
      <InputField label="イベント名" v-model="model" />
      <InputField label="連絡チャンネル" v-model="model" />
      <TextareaField label="イベント概要" />
    </div>
    <div card grid gap-6>
      <h3 hm>場所と日時</h3>
      <PlaceListField />
      <DateListField />
    </div>
    <div card grid gap-6>
      <h3 hm>メンバー</h3>
      <InputField label="管理者" v-model="model" />
      <InputField label="招待する参加者" v-model="model" />
    </div>
    <div grid-justify-self-center>
      <PrimaryButton>イベントを作成</PrimaryButton>
    </div>
  </div>
</template>
