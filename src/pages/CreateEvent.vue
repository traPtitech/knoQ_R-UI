<script lang="ts" setup>
import InputField from '/@/components/UI/Form/InputField.vue'
import AppHeader from '/@/components/AppHeader.vue'
import TextareaField from '/@/components/UI/Form/TextareaField.vue'
import PlaceListField from '../features/event/components/PlaceListField.vue'
import PrimaryButton from '../components/UI/Button/PrimaryButton.vue'
import DateListField from '../features/event/components/DateListField.vue'
import { ref } from 'vue'
import { EventForm, defaultValues } from '../features/event/forms/eventForm'
import { useApiFetch } from '/@/composables/useApiFetch'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref<EventForm>(defaultValues)

const error = ref<Error | null>(null)

const onSubmit = async () => {
  try {
    const { data, error: postError } = await apiClient.POST('/events', {
      body: form.value
    })
    if (postError) {
      error.value = postError
      return
    }
    if (data) {
      router.push(`/events/${data.eventId}`)
    }
  } catch (e) {
    error.value = e as Error
  }
}
</script>
<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-4>
    <h2 hl>イベントを作成する</h2>
    <div card grid gap-6>
      <h3 hm>基本情報</h3>
      <InputField v-model="form.name" label="イベント名" />
      <InputField v-model="form.group.name" label="連絡チャンネル" />
      <TextareaField v-model="form.description" label="イベント概要" />
    </div>
    <div card grid gap-6>
      <h3 hm>場所と日時</h3>
      <PlaceListField v-model="form.placeTimes" />
      <DateListField v-model="form.placeTimes" />
    </div>
    <div card grid gap-6>
      <h3 hm>メンバー</h3>
      <InputField v-model="form.admins" label="管理者" />
      <InputField v-model="form.group.members" label="招待する参加者" />
    </div>
    <div grid-justify-self-center>
      <PrimaryButton @click="onSubmit">イベントを作成</PrimaryButton>
    </div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>
