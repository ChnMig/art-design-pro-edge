<template>
  <el-config-provider :size="elSize" :z-index="3000">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import { initState, saveUserData } from './utils/storage'
  import { getUserInfo } from './api/system/api'
  import { ApiStatus } from '@api/status'

  const userStore = useUserStore()
  const elSize = computed(() => (document.body.clientWidth >= 500 ? 'large' : 'default'))

  onBeforeMount(() => {
    setBodyClass(true)
  })

  onMounted(() => {
    initState()
    saveUserData()
    setBodyClass(false)
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

  // 提升暗黑主题下页面刷新视觉体验
  const setBodyClass = (addClass: boolean) => {
    let el = document.getElementsByTagName('body')[0]

    if (addClass) {
      el.setAttribute('class', 'theme-change')
    } else {
      setTimeout(() => {
        el.removeAttribute('class')
      }, 300)
    }
  }
</script>
