<template>
  <div class="login register">
    <div class="left-wrap">
      <LoginLeftView></LoginLeftView>
    </div>
    <div class="right-wrap">
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">忘记密码？</h3>
          <p class="sub-title">请联系管理员重置您的密码</p>
          <div class="qrcode-container">
            <img :src="qrcodeImage" alt="联系管理员二维码" class="qrcode-img" />
            <p class="qrcode-tip">扫描上方二维码联系管理员</p>
          </div>

          <div style="margin-top: 25px">
            <el-button class="back-btn" plain @click="toLogin"> 返回登录 </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import qrcodePng from '@/assets/img/admin/qrcode.png'
  const router = useRouter()
  defineOptions({ name: 'ForgetPassword' })
  const systemName = AppConfig.systemInfo.name
  const qrcodeImage = ref(qrcodePng)

  const toLogin = () => {
    router.push('/auth/login')
  }
</script>

<style lang="scss" scoped>
  @use '../login/index';
  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;
  }

  .qrcode-img {
    width: 180px;
    height: 180px;
    margin: 15px 0;
  }

  .qrcode-tip {
    color: #606266;
    font-size: 14px;
  }
</style>
