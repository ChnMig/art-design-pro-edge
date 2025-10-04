<template>
  <div class="login">
    <LoginLeftView></LoginLeftView>

    <div class="right-wrap">
      <div class="top-right-wrap">
        <div v-if="shouldShowThemeToggle" class="btn theme-btn" @click="themeAnimation">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <ElDropdown
          v-if="shouldShowLanguage"
          @command="changeLanguage"
          popper-class="langDropDownStyle"
        >
          <div class="btn language-btn">
            <i class="iconfont-sys icon-language">&#xe611;</i>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
                <ElDropdownItem
                  :command="lang.value"
                  :class="{ 'is-selected': locale === lang.value }"
                >
                  <span class="menu-txt">{{ lang.label }}</span>
                  <i v-if="locale === lang.value" class="iconfont-sys icon-check">&#xe621;</i>
                </ElDropdownItem>
              </div>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="tenant_code">
              <ElInput v-model.trim="formData.tenant_code" :placeholder="tenantPlaceholder" />
            </ElFormItem>
            <ElFormItem prop="account">
              <ElInput v-model.trim="formData.account" :placeholder="accountPlaceholder" />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                :placeholder="passwordPlaceholder"
                v-model.trim="formData.password"
                type="password"
                radius="8px"
                autocomplete="off"
                show-password
              />
            </ElFormItem>
            <ElFormItem prop="captcha">
              <div class="captcha-wrap">
                <ElInput v-model.trim="formData.captcha" :placeholder="captchaPlaceholder" />
                <img
                  v-if="captchaImageUrl"
                  :src="captchaImageUrl"
                  class="captcha-image"
                  alt="captcha"
                  @click="refreshCaptcha"
                  @error="handleImageError"
                />
                <div v-else class="captcha-loading" @click="refreshCaptcha">
                  {{ captchaLoadingText }}
                </div>
              </div>
            </ElFormItem>

            <div class="forget-password">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</ElCheckbox>
              <RouterLink :to="RoutesAlias.ForgetPassword">{{ $t('login.forgetPwd') }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="login-btn"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <!-- 内部系统不提供注册提示，移除“还没有账号？请联系管理员开通” -->
          </ElForm>
        </div>
      </div>
      <!-- 登录页不提供二维码弹窗入口（忘记密码页提供二维码） -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import AppConfig from '@/config'
  import { RoutesAlias } from '@/router/routesAlias'
  import { ElNotification, ElMessage } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { languageOptions } from '@/locales'
  import { LanguageEnum } from '@/enums/appEnum'
  import { useI18n } from 'vue-i18n'
  import { themeAnimation } from '@/utils/theme/animation'
  import { fetchLogin, fetchGetUserInfo, fetchCaptcha } from '@/api/auth'
  import { useHeaderBar } from '@/composables/useHeaderBar'
  import { useSettingStore } from '@/store/modules/setting'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)
  const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar()

  const userStore = useUserStore()
  const router = useRouter()

  const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()

  const formData = reactive({
    tenant_code: 'default',
    account: '',
    password: '',
    captcha: '',
    rememberPassword: true
  })

  const tenantPlaceholder = computed(() => t('login.tenantCodePlaceholder') || '请输入租户编码')
  const accountPlaceholder = computed(() => t('login.placeholder[0]') || '请输入账号')
  const passwordPlaceholder = computed(() => t('login.placeholder[1]') || '请输入密码')
  const captchaPlaceholder = computed(() => t('login.captchaPlaceholder') || '请输入验证码')
  const captchaLoadingText = computed(() => t('login.captchaLoading') || '加载中...')

  const rules = computed<FormRules>(() => ({
    tenant_code: [{ required: true, message: tenantPlaceholder.value, trigger: 'blur' }],
    account: [{ required: true, message: accountPlaceholder.value, trigger: 'blur' }],
    password: [{ required: true, message: passwordPlaceholder.value, trigger: 'blur' }],
    captcha: [{ required: true, message: captchaPlaceholder.value, trigger: 'blur' }]
  }))

  const loading = ref(false)
  const captchaImageUrl = ref('')
  const captchaId = ref('')
  // 登录页不再提供二维码弹窗逻辑（忘记密码页提供二维码联系管理员）

  const refreshCaptcha = async () => {
    try {
      const captcha = await fetchCaptcha(80, 240)
      captchaImageUrl.value = captcha.image
      captchaId.value = captcha.id
    } catch (error) {
      console.error('[Login] refreshCaptcha error:', error)
      ElMessage.error(t('login.captchaLoadFailed') || '验证码获取失败')
    }
  }

  const handleImageError = () => {
    ElMessage.error(t('login.captchaImageError') || '验证码加载失败，请点击刷新')
    captchaImageUrl.value = ''
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
      const loginRes = await fetchLogin({
        tenant_code: formData.tenant_code,
        account: formData.account,
        password: formData.password,
        captcha: formData.captcha,
        captcha_id: captchaId.value
      })

      if (!loginRes.access_token) {
        throw new Error(t('login.failedText') || '登录失败，请稍后重试')
      }

      userStore.setToken(loginRes.access_token, loginRes.refresh_token)
      userStore.setCurrentTenantCode(formData.tenant_code)
      userStore.setLoginStatus(true)

      const userInfo = await fetchGetUserInfo().catch((error) => {
        console.error('[Login] fetch user info error:', error)
        return undefined
      })

      if (userInfo) {
        userStore.setUserInfo(userInfo)
        if (userInfo.tenant) {
          userStore.setTenantInfo(userInfo.tenant as Record<string, any>)
        }
        if (userInfo.tenantCode) {
          userStore.setCurrentTenantCode(userInfo.tenantCode)
        }
      }

      showLoginSuccessNotice()
      router.push('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      ElMessage.error(message || t('login.failedText') || '登录失败，请稍后重试')
      await refreshCaptcha()
    } finally {
      loading.value = false
    }
  }

  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title') || '登录成功',
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message') || '欢迎回来'}, ${systemName}!`
      })
    }, 150)
  }

  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  onMounted(() => {
    refreshCaptcha()
  })
</script>

<style lang="scss" scoped>
  @use './index';
</style>
