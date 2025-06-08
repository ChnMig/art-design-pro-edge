import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { router } from '@/router'
import { UserInfo } from '@/types/store'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { MenuListType } from '@/types/menu'
import { setPageTitle } from '@/router/utils/utils'
import { resetRouterState } from '@/router/guards/beforeEach'
import { RoutesAlias } from '@/router/routesAlias'

// 用户
export const useUserStore = defineStore(
  'userStore',
  () => {
    const isLogin = ref(false)
    const isLock = ref(false)
    const lockPassword = ref('')
    const info = ref<Partial<UserInfo>>({})
    const searchHistory = ref<MenuListType[]>([])
    const accessToken = ref('')
    const refreshToken = ref('')

    const getUserInfo = computed(() => info.value)
    const getSettingState = computed(() => useSettingStore().$state)
    const getWorktabState = computed(() => useWorktabStore().$state)

    const setUserInfo = (newInfo: UserInfo) => {
      info.value = newInfo
    }

    const setLoginStatus = (status: boolean) => {
      isLogin.value = status
    }

    const setSearchHistory = (list: MenuListType[]) => {
      searchHistory.value = list
    }

    const setLockStatus = (status: boolean) => {
      isLock.value = status
    }

    const setLockPassword = (password: string) => {
      lockPassword.value = password
    }

    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken
      }
    }

    const logOut = () => {
      info.value = {}
      isLogin.value = false
      isLock.value = false
      lockPassword.value = ''
      accessToken.value = ''
      refreshToken.value = ''
      useWorktabStore().opened = []
      sessionStorage.removeItem('iframeRoutes')
      resetRouterState(router)
      router.push(RoutesAlias.Login)
    }

    return {
      isLogin,
      isLock,
      lockPassword,
      info,
      searchHistory,
      accessToken,
      refreshToken,
      getUserInfo,
      getSettingState,
      getWorktabState,
      setUserInfo,
      setLoginStatus,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      logOut
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage
    }
  }
)
