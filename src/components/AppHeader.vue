<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '/@/assets/logo.svg'
import PrimaryButton from './UI/Button/PrimaryButton.vue';
import { apiClient } from '/@/lib/api';

const clickLogin = async ()=>{
    const { data }  = await apiClient.POST("/authParams")
    if (data){
        window.location.assign(data.url)
    }
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
    <div justify-self-center grid grid-cols-3 gap-8>
      <RouterLink hxs to="/">イベント </RouterLink>
      <RouterLink hxs to="/">イベント </RouterLink>
      <RouterLink hxs to="/">探す</RouterLink>
    </div>
    <PrimaryButton py-2 @click="clickLogin">
        ログイン
    </PrimaryButton>
  </div>
</template>
