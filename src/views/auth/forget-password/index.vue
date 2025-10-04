<template>
  <div class="login register">
    <LoginLeftView></LoginLeftView>
    <div class="right-wrap">
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ $t('login.scanQrcode') }}</p>

          <div class="qrcode-wrapper">
            <QrcodeVue :value="adminQrcodeValue" :size="200" :level="'M'" />
            <ElText type="info" size="small" style="margin-top: 10px">{{
              $t('login.contactAdmin')
            }}</ElText>
          </div>

          <div style="margin-top: 15px">
            <ElButton class="back-btn" plain @click="toLogin">
              {{ $t('forgetPassword.backBtnText') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { RoutesAlias } from '@/router/routesAlias'
  import QrcodeVue from 'qrcode.vue'

  defineOptions({ name: 'ForgetPassword' })

  const router = useRouter()
  const systemName = AppConfig.systemInfo.name
  const adminQrcodeValue = computed(() => import.meta.env.VITE_ADMIN_QRCODE_URL || location.origin)

  const toLogin = () => {
    router.push(RoutesAlias.Login)
  }
</script>

<style lang="scss" scoped>
  @use '../login/index';

  .qrcode-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 0;
  }
</style>
