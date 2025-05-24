<template>
  <div class="LoginLeftView">
    <div class="logo">
      <ArtLogo class="icon" />
      <h1 class="title">{{ AppConfig.systemInfo.name }}</h1>
    </div>
    <img class="left-bg" src="@imgs/login/lf_bg.png" />
    <img class="left-img" src="@imgs/login/lf_icon2.png" />

    <div class="text-wrap">
      <h1>专注于用户体验的后台管理系统模版</h1>
      <a class="beian-link" href="https://beian.miit.gov.cn/" target="_blank"
        >苏ICP备XXXXXXXXXX号-X</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  // 🔔 该文件是登录页面左侧视图组件
  import AppConfig from '@/config'
</script>

<style lang="scss" scoped>
  @use '@/views/login/index' as login;
  .beian-link {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: all 0.3s ease;
    padding: 2px 0;
    &:hover {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: underline;
    }
  }
</style>
