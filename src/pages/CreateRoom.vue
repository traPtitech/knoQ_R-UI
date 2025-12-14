<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import PrimaryButton from '../components/UI/Button/PrimaryButton.vue'
import TextareaField from '../components/UI/Form/TextareaField.vue'
import { apiClient } from '../lib/api'

const csvContent = ref('')
const statusMessage = ref('')
const isError = ref(false)

const submit = async () => {
  if (!csvContent.value) return

  statusMessage.value = '送信中...'
  isError.value = false

  const { error } = await apiClient.POST('/rooms/all', {
    body: csvContent.value,
    headers: { 'Content-Type': 'text/csv' },
    bodySerializer: (s) => s
  })

  if (error) {
    statusMessage.value = 'エラーが発生しました'
    isError.value = true
  } else {
    statusMessage.value = '追加しました'
    csvContent.value = ''
  }
}
</script>

<template>
  <AppHeader />
  <div class="grid mx-auto max-w-3xl gap-8 p-4">
    <h1 hl>進捗部屋作成</h1>

    <div grid gap-6 card>
      <div class="text-text-secondary">
        <p class="mb-2">CSV形式で進捗部屋を一括登録できます。</p>
        <p class="mb-1 text-sm font-bold">フォーマット例:</p>
        <div
          class="overflow-x-auto whitespace-pre border border-border-secondary rounded bg-surface-secondary p-4 text-sm font-mono"
        >
          Subject,Location,Start date,End date,Start time,End time<br />進捗部屋,S2-201
          (S224),2025/12/25,2025/12/25,12:25,18:55
        </div>
      </div>

      <TextareaField
        id="csv-input"
        v-model="csvContent"
        label="CSVデータ"
        placeholder="ここにCSVデータを貼り付けてください"
        rows="10"
      />

      <div class="flex items-center gap-4">
        <PrimaryButton :disabled="!csvContent" @click="submit">
          追加
        </PrimaryButton>
        <span
          v-if="statusMessage"
          :class="isError ? 'text-red-500' : 'text-green-600'"
          class="text-sm font-bold"
        >
          {{ statusMessage }}
        </span>
      </div>
    </div>
  </div>
</template>
