<template>
  <div class="left-view">
    <div class="logo">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconsys-zhaopian-copy"></use>
      </svg>
      <h1 class="title">{{ systemName }}</h1>
    </div>
    <img class="left-bg" src="@imgs/login/lf_bg.png" />
    <img class="left-img" src="@imgs/login/lf_icon2.png" />

    <div class="text-wrap">
      <h1>专注于用户体验的后台管理系统模版</h1>
      <p>美观实用的界面，经过视觉优化，确保卓越的用户体验</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 🔔 该文件是登录页面左侧视图组件
  import { SystemInfo } from '@/config/setting'

  const systemName = SystemInfo.name
</script>

<style lang="scss" scoped>
  @use '@/views/login/index' as login;
</style>
