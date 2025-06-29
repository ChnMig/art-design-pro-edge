<template>
  <div class="layout-top-bar" :class="[tabStyle]" :style="{ width: topBarWidth() }">
    <div class="menu">
      <div class="left" style="display: flex">
        <!-- 系统信息  -->
        <div class="top-header" @click="toHome" v-if="isTopMenu">
          <ArtLogo class="logo" />
          <p v-if="width >= 1400">{{ AppConfig.systemInfo.name }}</p>
        </div>
        <ArtLogo class="logo2" @click="toHome" />
        <!-- 菜单按钮 -->
        <div class="btn-box" v-if="isLeftMenu && showMenuButton">
          <div class="btn menu-btn">
            <i class="iconfont-sys" @click="visibleMenu">&#xe6ba;</i>
          </div>
        </div>
        <!-- 刷新按钮 -->
        <div class="btn-box" v-if="showRefreshButton">
          <div class="btn refresh-btn" :style="{ marginLeft: !isLeftMenu ? '10px' : '0' }">
            <i class="iconfont-sys" @click="reload()"> &#xe6b3; </i>
          </div>
        </div>

        <!-- 面包屑 -->
        <ArtBreadcrumb v-if="(showCrumbs && isLeftMenu) || (showCrumbs && isDualMenu)" />

        <!-- 顶部菜单 -->
        <ArtHorizontalMenu v-if="isTopMenu" :list="menuList" :width="menuTopWidth" />

        <!-- 混合菜单-顶部 -->
        <ArtMixedMenu v-if="isTopLeftMenu" :list="menuList" :width="menuTopWidth" />
      </div>

      <div class="right">
        <!-- 搜索 -->
        <div class="search-wrap">
          <div class="search-input" @click="openSearchDialog">
            <div class="left">
              <i class="iconfont-sys">&#xe710;</i>
              <span>搜索</span>
            </div>
            <div class="search-keydown">
              <i class="iconfont-sys" v-if="isWindows">&#xeeac;</i>
              <i class="iconfont-sys" v-else>&#xe9ab;</i>
              <span>k</span>
            </div>
          </div>
        </div>

        <!-- 全屏按钮 -->
        <div class="btn-box screen-box" @click="toggleFullScreen">
          <div
            class="btn"
            :class="{ 'full-screen-btn': !isFullscreen, 'exit-full-screen-btn': isFullscreen }"
          >
            <i class="iconfont-sys">{{ isFullscreen ? '&#xe62d;' : '&#xe8ce;' }}</i>
          </div>
        </div>

        <!-- 设置 -->
        <div class="btn-box" @click="openSetting">
          <el-popover :visible="showSettingGuide" placement="bottom-start" :width="190" :offset="0">
            <template #reference>
              <div class="btn setting-btn">
                <i class="iconfont-sys">&#xe6d0;</i>
              </div>
            </template>
            <template #default>
              <p
                >点击这里查看<span :style="{ color: systemThemeColor }"> 主题风格 </span>、
                <span :style="{ color: systemThemeColor }"> 开启顶栏菜单 </span>等更多配置
              </p>
            </template>
          </el-popover>
        </div>
        <!-- 切换主题 -->
        <div class="btn-box" @click="themeAnimation">
          <div class="btn theme-btn">
            <i class="iconfont-sys">{{ isDark ? '&#xe6b5;' : '&#xe725;' }}</i>
          </div>
        </div>

        <!-- 用户头像、菜单 -->
        <div class="user">
          <el-popover
            ref="userMenuPopover"
            placement="bottom-end"
            :width="240"
            :hide-after="0"
            :offset="10"
            trigger="hover"
            :show-arrow="false"
            popper-class="user-menu-popover"
            popper-style="border: 1px solid var(--art-border-dashed-color); border-radius: calc(var(--custom-radius) / 2 + 4px); padding: 5px 16px; 5px 16px;"
          >
            <template #reference>
              <img
                class="cover"
                :src="userInfo.avatar"
                ref="userAvatarRef"
                tabindex="-1"
                alt="avatar"
              />
            </template>
            <template #default>
              <div class="user-menu-box">
                <div class="user-head">
                  <img class="cover" :src="userInfo.avatar" style="float: left" />
                  <div class="user-wrap">
                    <span class="name">{{ userInfo.name }}</span>
                    <span class="email" v-if="userInfo.email">{{ userInfo.email }}</span>
                  </div>
                </div>
                <ul class="user-menu">
                  <li @click="lockScreen()">
                    <i class="menu-icon iconfont-sys">&#xe817;</i>
                    <span class="menu-txt">锁定屏幕</span>
                  </li>
                  <li @click="openEditInfo()">
                    <i class="menu-icon iconfont-sys">&#xe6e0;</i>
                    <span class="menu-txt">修改个人信息</span>
                  </li>
                  <div class="line"></div>
                  <div class="logout-btn" @click="loginOut"> 退出登录 </div>
                </ul>
              </div>
            </template>
          </el-popover>
        </div>
      </div>
    </div>
    <ArtWorkTab />
  </div>
</template>

<script setup lang="ts">
  import { MenuTypeEnum, MenuWidth } from '@/enums/appEnum'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useFullscreen } from '@vueuse/core'
  import { ElMessageBox } from 'element-plus'
  import { mittBus } from '@/utils/sys'
  import { useMenuStore } from '@/store/modules/menu'
  import AppConfig from '@/config'
  import { themeAnimation } from '@/utils/theme/animation'
  import { nextTick, ref } from 'vue' // Ensure ref is imported

  const isWindows = navigator.userAgent.includes('Windows')

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const router = useRouter()

  const {
    showMenuButton,
    showRefreshButton,
    menuOpen,
    showCrumbs,
    systemThemeColor,
    showSettingGuide,
    menuType,
    isDark,
    tabStyle
  } = storeToRefs(settingStore)

  const { getUserInfo: userInfo } = storeToRefs(userStore)

  const { menuList } = storeToRefs(useMenuStore())

  const showNotice = ref(false)
  const userMenuPopover = ref()
  const userAvatarRef = ref() // Add a ref for the avatar image

  const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT)
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)
  const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)

  import { useCommon } from '@/composables/useCommon'

  const { width } = useWindowSize()

  const menuTopWidth = computed(() => {
    return width.value * 0.5
  })

  onMounted(() => {
    document.addEventListener('click', bodyCloseNotice)
  })

  onUnmounted(() => {
    document.removeEventListener('click', bodyCloseNotice)
  })

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  const toggleFullScreen = () => {
    toggleFullscreen()
  }

  const topBarWidth = (): string => {
    const { TOP, DUAL_MENU, TOP_LEFT } = MenuTypeEnum
    const { getMenuOpenWidth } = settingStore
    const { isFirstLevel } = router.currentRoute.value.meta
    const type = menuType.value
    const isMenuOpen = menuOpen.value

    const isTopLayout = type === TOP || (type === TOP_LEFT && isFirstLevel)

    if (isTopLayout) {
      return '100%'
    }

    if (type === DUAL_MENU) {
      return isFirstLevel ? 'calc(100% - 80px)' : `calc(100% - 80px - ${getMenuOpenWidth})`
    }

    return isMenuOpen ? `calc(100% - ${getMenuOpenWidth})` : `calc(100% - ${MenuWidth.CLOSE})`
  }

  const visibleMenu = () => {
    settingStore.setMenuOpen(!menuOpen.value)
  }

  const toHome = () => {
    router.push(useCommon().homePath.value)
  }

  const lockScreen = () => {
    console.log('lockScreen')
    mittBus.emit('openLockScreen')
  }

  const openEditInfo = () => {
    closeUserMenu()
    nextTick(() => {
      // Explicitly move focus back to the avatar before opening the dialog
      if (userAvatarRef.value) {
        userAvatarRef.value.focus()
      }
      mittBus.emit('openEditInfoDialog')
    })
  }

  const loginOut = () => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm('您是否要退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  const reload = (time: number = 0) => {
    setTimeout(() => {
      settingStore.reload()
    }, time)
  }

  const openSetting = () => {
    mittBus.emit('openSetting')

    // 隐藏设置引导
    if (showSettingGuide.value) {
      settingStore.hideSettingGuide()
    }
    // 打开设置引导
    // settingStore.openSettingGuide()
  }

  const openSearchDialog = () => {
    mittBus.emit('openSearchDialog')
  }

  const bodyCloseNotice = (e: any) => {
    let { className } = e.target

    if (showNotice.value) {
      if (typeof className === 'object') {
        showNotice.value = false
        return
      }
      if (className.indexOf('notice-btn') === -1) {
        showNotice.value = false
      }
    }
  }

  const closeUserMenu = () => {
    // Check if userMenuPopover.value exists and has a hide method
    if (userMenuPopover.value && typeof userMenuPopover.value.hide === 'function') {
      userMenuPopover.value.hide()
    } else {
      console.warn('userMenuPopover ref or hide method not found.')
    }
  }
</script>

<style lang="scss" scoped>
  @use './style';
  @use './mobile';
</style>
