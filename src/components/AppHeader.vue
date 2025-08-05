<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '/@/assets/logo.svg'
import PrimaryButton from './UI/Button/PrimaryButton.vue'
import { apiClient } from '/@/lib/api'
import { useMe } from '/@/features/user/composables/useMe'
import UserIcon from './UI/UserIcon.vue'
import DropdownMenu from './UI/DropdownMenu.vue'

const { me, setMe } = useMe()

const clickLogin = async () => {
  const { data } = await apiClient.POST('/authParams')
  if (data) {
    window.location.assign(data.url)
  }
}

const clickLogout = async () => {
  setMe(null)
}
</script>

<template>
  <div
    p-4
    flex
    flex-justify-between
    flex-items-center
    b-b="1 solid border-secondary"
  >
    <RouterLink to="/" justify-self-start>
      <img :src="logo" alt="Logo" w-8 h-8 />
    </RouterLink>
    <div grid grid-flow-col gap-8>
      <RouterLink hxs to="/events">イベント</RouterLink>
      <RouterLink hxs to="/calendar">カレンダー</RouterLink>
      <RouterLink hxs to="/ical">iCal</RouterLink>
      <RouterLink hxs to="/">探す</RouterLink>
    </div>
    <div v-if="me" grid grid-flow-col grid-items-center gap-4>
      <RouterLink btn-primary to="/events/new"> イベント作成 </RouterLink>
      <DropdownMenu>
        <template #trigger>
          <UserIcon :user-id="me.name" />
        </template>
        <div class="py-1">
          <RouterLink
            to="/me"
            class="block px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary"
            >マイページ</RouterLink
          >
          <button
            @click="clickLogout"
            class="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary"
          >
            ログアウト
          </button>
        </div>
      </DropdownMenu>
    </div>
    <PrimaryButton v-else py-2 @click="clickLogin"> ログイン </PrimaryButton>
  </div>
</template>
