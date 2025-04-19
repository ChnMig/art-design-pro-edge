<template>
  <div class="login register">
    <div class="left-wrap">
      <LoginLeftView></LoginLeftView>
    </div>
    <div class="right-wrap">
      <div class="header">
        <img class="icon" src="@/assets/img/logo.svg" alt="logo" />
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
            <el-button style="width: 100%; height: 46px" size="large" plain @click="toLogin">
              返回登录
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  const router = useRouter()

  const systemName = AppConfig.systemInfo.name
  // 替换为实际的二维码图片路径
  const qrcodeImage = ref('src/assets/img/admin/qrcode.png')

  const toLogin = () => {
    router.push('/login')
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
