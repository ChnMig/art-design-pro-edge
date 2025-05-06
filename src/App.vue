<template>
  <ElConfigProvider size="default" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import { initState, saveUserData } from './utils/storage'
  import { getUserInfo } from './api/system/api'
  import { ApiStatus } from '@api/status'
  import { setThemeTransitionClass } from './utils/theme/animation'

  const userStore = useUserStore()

  onBeforeMount(() => {
    setThemeTransitionClass(true)
  })

  onMounted(() => {
    initState()
    saveUserData()
    setThemeTransitionClass(false)
    getUserInfoData()
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
