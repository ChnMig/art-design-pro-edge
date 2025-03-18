<template>
  <div class="login">
    <div class="left-wrap">
      <left-view></left-view>
    </div>
    <div class="right-wrap">
      <div class="top-right-wrap">
        <div class="btn theme-btn" @click="toggleTheme">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <el-dropdown @command="changeLanguage" popper-class="langDropDownStyle">
          <div class="btn language-btn">
            <i class="iconfont-sys icon-language">&#xe611;</i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
                <el-dropdown-item
                  :command="lang.value"
                  :class="{ 'is-selected': locale === lang.value }"
                >
                  <span class="menu-txt">{{ lang.label }}</span>
                  <i v-if="locale === lang.value" class="iconfont-sys icon-check">&#xe621;</i>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <el-form-item prop="username">
              <el-input
                :placeholder="$t('login.placeholder[0]')"
                size="large"
                v-model.trim="formData.username"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                :placeholder="$t('login.placeholder[1]')"
                size="large"
                v-model.trim="formData.password"
                type="password"
                radius="8px"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item prop="captcha">
              <el-row :gutter="5">
                <el-col :span="16">
                  <el-input
                    :placeholder="$t('login.placeholder[2]')"
                    size="large"
                    v-model.trim="formData.captcha"
                  />
                </el-col>
                <el-col :push="1" :span="8">
                  <img :src="captchaImageUrl" @click="refreshCaptcha" class="captcha-image" />
                </el-col>
              </el-row>
            </el-form-item>
            <div class="forget-password">
              <el-checkbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</el-checkbox>
              <router-link to="/forget-password">{{ $t('login.forgetPwd') }}</router-link>
            </div>

            <div style="margin-top: 30px">
              <el-button
                class="login-btn"
                size="large"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import LeftView from '@/components/Pages/Login/LeftView.vue'
  import { SystemInfo } from '@/config/setting'
  import { ElMessage, ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { HOME_PAGE } from '@/router'
  import { ApiStatus } from '@/utils/http/status'
  import { LanguageEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  import { useSettingStore } from '@/store/modules/setting'
  import type { FormInstance, FormRules } from 'element-plus'
  import { onMounted, ref, reactive, computed } from 'vue'
  import { getCaptcha, login } from '@/api/login/api'

  const userStore = useUserStore()
  const router = useRouter()

  const systemName = SystemInfo.name
  const formRef = ref<FormInstance>()
  const formData = reactive({
    username: SystemInfo.login.username,
    password: SystemInfo.login.password,
    rememberPassword: true,
    captcha: ''
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder[0]'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder[1]'), trigger: 'blur' }],
    captcha: [{ required: true, message: t('login.placeholder[2]'), trigger: 'blur' }]
  }))

  const loading = ref(false)

  const store = useSettingStore()
  const isDark = computed(() => store.isDark)

  const captchaImageUrl = ref('') // 验证码图片的URL
  const captchaImageID = ref('') // 验证码图片的ID

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true

        // 延时辅助函数
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

        try {
          const res = await login({
            username: formData.username,
            password: formData.password,
            captcha: formData.captcha,
            captcha_id: captchaImageID.value
          })

          if (res.code === ApiStatus.success && res.data) {
            // 设置 token
            userStore.setToken(res.data.accessToken)

            // 获取用户信息
            const userRes = await getCaptcha()
            if (userRes.code === ApiStatus.success) {
              userStore.setUserInfo(userRes.data)
            }

            // 设置登录状态
            userStore.setLoginStatus(true)
            // 延时辅助函数
            await delay(1000)
            // 登录成功提示
            showLoginSuccessNotice()
            // 跳转首页
            router.push(HOME_PAGE)
          } else {
            ElMessage.error(res.message)
            refreshCaptcha()
          }
        } finally {
          await delay(1000)
          loading.value = false
        }
      }
    })
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        showClose: false,
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${systemName}!`
      })
    }, 300)
  }
  // 切换语言
  const { locale } = useI18n()

  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  // 切换主题
  import { useTheme } from '@/composables/useTheme'

  const toggleTheme = () => {
    let { LIGHT, DARK } = SystemThemeEnum
    useTheme().switchTheme(useSettingStore().systemThemeType === LIGHT ? DARK : LIGHT)
  }

  // 语言配置
  const languageOptions = [
    { value: LanguageEnum.ZH, label: '简体中文' },
    { value: LanguageEnum.EN, label: 'English' }
  ]

  const refreshCaptcha = async () => {
    try {
      const captchaData = await getCaptcha(80, 240)
      captchaImageUrl.value = captchaData.data.image
      captchaImageID.value = captchaData.data.id
    } catch (error) {
      console.error('Error refreshing captcha:', error)
      ElMessage.error('验证码获取失败')
    }
  }

  onMounted(() => {
    refreshCaptcha() // 页面加载时获取验证码
  })
</script>

<style lang="scss" scoped>
  @use './index';
</style>
