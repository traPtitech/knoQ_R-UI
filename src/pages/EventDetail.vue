<script setup lang="ts">
import { ComputedRef, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { fetchEvent } from '/@/features/event/api'
import { useMySchedule } from '/@/features/event/composables/useMySchedule'
import { useMe } from '/@/features/user/composables/useMe'
import { Schedule } from '/@/features/event/types'
import AppHeader from '/@/components/AppHeader.vue'
import IconWithName from '/@/features/user/components/IconWithName.vue'
import AttendanceButton from '/@/features/event/components/AttendanceButton.vue'
import SchedulePoll from '/@/features/event/components/SchedulePoll.vue'
import InvitationLinkButton from '/@/features/event/components/InvitationLinkButton.vue'
import DescriptionMd from '/@/features/event/components/DescriptionMd.vue'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import DataFetchState from '/@/components/UI/DataFetchState.vue'

const route = useRoute()
const router = useRouter()
const eventId: ComputedRef<string> = computed(() => route.params.id as string)

const { event, error, mutate, state } = fetchEvent(eventId.value)
const { me } = useMe()
const { canUpdate, mySchedule, updateMySchedule } = useMySchedule(me, event)

const onUpdateMySchedule = async (schedule: Schedule) => {
  await updateMySchedule(schedule)
  mutate()
}

const onDelete = async () => {
  //await deleteEvent(eventId.value)
  router.push('/')
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${format(startDate, 'yyyy/MM/dd HH:mm', { locale: ja })} - ${format(endDate, 'HH:mm', { locale: ja })}`
}
</script>

<template>
  <AppHeader />
  <div class="grid mx-auto max-w-5xl gap-8 px-4 py-8">
    <DataFetchState :state="state">
      <div v-if="event" class="grid gap-8">
        <!-- Header Section -->
        <div class="grid gap-4">
          <!-- Tags -->
          <div v-if="event.tags.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="tag in event.tags"
              :key="tag.tagId"
              class="rounded bg-surface-secondary px-2 py-1 text-sm text-text-secondary font-medium"
            >
              #{{ tag.name }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl text-text-primary font-bold">{{ event.name }}</h1>

          <!-- Meta Info -->
          <div class="flex flex-wrap gap-x-8 gap-y-3 text-text-primary">
            <!-- Time -->
            <div class="flex items-center gap-2">
              <div class="i-mdi:clock-outline text-xl text-text-secondary" />
              <span>{{ formatDateRange(event.timeStart, event.timeEnd) }}</span>
            </div>
            <!-- Place -->
            <div class="flex items-center gap-2">
              <div class="i-mdi:map-marker text-xl text-text-secondary" />
              <span>{{ event.place }}</span>
            </div>
            <!-- Organizer -->
            <div class="flex items-center gap-2">
              <div class="i-mdi:account-group text-xl text-text-secondary" />
              <span>{{ event.groupName }}</span>
            </div>
            <!-- Admins/CreatedBy -->
            <div class="flex items-center gap-2">
              <div class="i-mdi:account-edit text-xl text-text-secondary" />
              <span class="mr-1 text-sm text-text-secondary">作成者:</span>
              <IconWithName :user-id="event.createdBy" />
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <!-- Left Column: Description & Poll -->
          <div class="grid min-w-0 gap-8">
            <!-- Description -->
            <div
              class="border border-border-secondary rounded-xl bg-surface-primary p-6 shadow-sm"
            >
              <h2
                class="mb-6 flex items-center gap-2 border-b border-border-secondary pb-4 text-xl font-bold"
              >
                <div class="i-mdi:text-box-outline text-2xl" />
                イベント概要
              </h2>
              <DescriptionMd :markdown="event.description" />
            </div>

            <!-- Schedule Poll -->
            <div
              class="border border-border-secondary rounded-xl bg-surface-primary p-6 shadow-sm"
            >
              <h2
                class="mb-6 flex items-center gap-2 border-b border-border-secondary pb-4 text-xl font-bold"
              >
                <div class="i-mdi:calendar-check text-2xl" />
                日程調整
              </h2>
              <SchedulePoll
                :event="event"
                @update:my-schedule="onUpdateMySchedule"
              />
            </div>
          </div>

          <!-- Right Column: Actions & Status -->
          <div class="sticky top-4 grid gap-6">
            <!-- Participation Status -->
            <div
              class="grid gap-4 border border-border-secondary rounded-xl bg-surface-primary p-6 shadow-sm"
            >
              <h2 class="flex items-center gap-2 text-lg font-bold">
                <div class="i-mdi:account-check" />
                参加登録
              </h2>
              <AttendanceButton
                :schedule="mySchedule"
                class="w-full justify-center py-2"
                @update:schedule="onUpdateMySchedule"
              />
            </div>

            <!-- Share -->
            <div
              class="grid gap-4 border border-border-secondary rounded-xl bg-surface-primary p-6 shadow-sm"
            >
              <h2 class="flex items-center gap-2 text-lg font-bold">
                <div class="i-mdi:share-variant" />
                共有
              </h2>
              <InvitationLinkButton :event-id="eventId" class="w-full" />
            </div>

            <!-- Admin Actions -->
            <div
              v-if="canUpdate"
              class="grid gap-4 border border-border-secondary rounded-xl bg-surface-primary p-6 shadow-sm"
            >
              <h2 class="flex items-center gap-2 text-lg font-bold">
                <div class="i-mdi:cog" />
                管理者メニュー
              </h2>
              <PrimaryButton
                class="bg-error hover:bg-error/90 w-full justify-center text-white"
                @click="onDelete"
              >
                イベントを削除
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </DataFetchState>
  </div>
</template>
