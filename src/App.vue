<template>
  <ElConfigProvider size="default" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import { getUserInfo } from './api/system/api'
  import { systemUpgrade } from './utils/upgrade'
  import { ApiStatus } from '@api/status'
  import { setThemeTransitionClass } from './utils/theme/animation'
  import { checkStorageCompatibility } from './utils/storage/storage'

  const userStore = useUserStore()

  onBeforeMount(() => {
    setThemeTransitionClass(true)
  })

  onMounted(() => {
    // 检查存储兼容性
    checkStorageCompatibility()
    // 提升暗黑主题下页面刷新视觉体验
    setThemeTransitionClass(false)
    // 系统升级
    systemUpgrade()
    // 获取用户信息
    getUserInfo()
  })

  // 获取用户信息
  const getUserInfoData = async () => {
    if (userStore.isLogin) {
      const res = await getUserInfo()
      if (res.code === ApiStatus.SUCCESS) {
        userStore.setUserInfo(res.data)
      }
    }
  }
</script>
