<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import logo from '/@/assets/logo.svg'
import PrimaryButton from '/@/components/UI/Button/PrimaryButton.vue'
import { apiClient } from '/@/lib/api'
import { useMe } from '/@/features/user/composables/useMe'
import UserIcon from '/@/components/UI/UserIcon.vue'
import DropdownMenu from '/@/components/UI/DropdownMenu.vue'

const { me } = useMe()
const route = useRoute()
const navigation = [
  { to: '/', label: 'ホーム' },
  { to: '/calendar', label: 'カレンダー' },
  { to: '/events', label: 'イベントを探す' },
  { to: '/rooms', label: '進捗部屋' },
  { to: '/draft-events', label: '日程調整' },
  { to: '/ical', label: 'iCal' }
]
const isCurrent = (path: string) =>
  path === '/' ? route.path === '/' : route.path.startsWith(path)
const clickLogin = async () => {
  const { data } = await apiClient.POST('/authParams')
  if (data) window.location.assign(data.url)
}
const clickLogout = async () => {
  // Logout is not implemented by the existing application.
}
</script>

<template>
  <header class="border-b border-border-secondary bg-surface-primary">
    <div class="page-shell">
      <div class="min-h-20 flex items-center justify-between gap-4 py-4">
        <RouterLink
          to="/"
          aria-label="knoQ ホーム"
          class="flex shrink-0 items-center gap-3"
        >
          <img :src="logo" alt="" class="h-9 w-9" />
          <span class="text-3xl font-bold tracking-tight">knoQ</span>
        </RouterLink>
        <div v-if="me" class="flex items-center gap-3 sm:gap-6">
          <RouterLink
            v-if="me.privileged"
            class="hidden text-sm link lg:block"
            to="/rooms/manage"
            >進捗部屋管理</RouterLink
          >
          <RouterLink
            class="hidden btn-secondary sm:inline-flex"
            to="/events/new"
          >
            <span class="i-mdi:plus text-xl" aria-hidden="true" />イベント作成
          </RouterLink>
          <DropdownMenu align="right" label="ユーザーメニュー">
            <template #trigger>
              <span class="min-h-11 flex items-center gap-2">
                <UserIcon :user-id="me.name" class="h-8 w-8" />
                <span class="hidden text-sm sm:inline">{{ me.name }}</span>
                <span class="i-mdi:chevron-down" aria-hidden="true" />
              </span>
            </template>
            <div class="py-2">
              <RouterLink
                to="/events/new"
                class="block px-4 py-3 sm:hidden hover:bg-surface-accent-soft"
                >イベント作成</RouterLink
              >
              <RouterLink
                v-if="me.privileged"
                to="/rooms/manage"
                class="block px-4 py-3 lg:hidden hover:bg-surface-accent-soft"
                >進捗部屋管理</RouterLink
              >
              <RouterLink
                to="/me"
                class="block px-4 py-3 hover:bg-surface-accent-soft"
                >マイページ</RouterLink
              >
              <button
                type="button"
                class="block w-full px-4 py-3 text-left hover:bg-surface-accent-soft"
                @click="clickLogout"
              >
                ログアウト
              </button>
            </div>
          </DropdownMenu>
        </div>
        <PrimaryButton v-else @click="clickLogin">ログイン</PrimaryButton>
      </div>
      <nav
        aria-label="メインナビゲーション"
        class="flex flex-wrap gap-x-5 sm:gap-x-8"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{
            '!border-surface-accent-primary !text-text-link': isCurrent(item.to)
          }"
          :aria-current="
            route.path === item.to
              ? 'page'
              : isCurrent(item.to)
                ? 'location'
                : undefined
          "
          >{{ item.label }}</RouterLink
        >
      </nav>
    </div>
  </header>
</template>
