<!-- 顶部栏 -->
<template>
  <div class="layout-top-bar" :class="[tabStyle]">
    <div class="menu">
      <div class="left" style="display: flex">
        <!-- 系统信息  -->
        <div class="top-header" @click="toHome" v-if="isTopMenu">
          <ArtLogo class="logo" />
          <p v-if="width >= 1400">{{ AppConfig.systemInfo.name }}</p>
        </div>

        <ArtLogo class="logo2" @click="toHome" />

        <!-- 菜单按钮 -->
        <div class="btn-box" v-if="isLeftMenu && shouldShowMenuButton">
          <div class="btn menu-btn">
            <i class="iconfont-sys" @click="visibleMenu">&#xe6ba;</i>
          </div>
        </div>
        <!-- 刷新按钮 -->
        <div class="btn-box" v-if="shouldShowRefreshButton">
          <div class="btn refresh-btn" :style="{ marginLeft: !isLeftMenu ? '10px' : '0' }">
            <i class="iconfont-sys" @click="reload()"> &#xe6b3; </i>
          </div>
        </div>

        <!-- 面包屑 -->
        <ArtBreadcrumb
          v-if="(shouldShowBreadcrumb && isLeftMenu) || (shouldShowBreadcrumb && isDualMenu)"
        />

        <!-- 顶部菜单 -->
        <ArtHorizontalMenu v-if="isTopMenu" :list="menuList" />

        <!-- 混合菜单-顶部 -->
        <ArtMixedMenu v-if="isTopLeftMenu" :list="menuList" />
      </div>

      <div class="right">
        <!-- 搜索 -->
        <div class="search-wrap" v-if="shouldShowGlobalSearch">
          <div class="search-input" @click="openSearchDialog">
            <div class="left">
              <i class="iconfont-sys">&#xe710;</i>
              <span>{{ '搜索' }}</span>
            </div>
            <div class="search-keydown">
              <i class="iconfont-sys" v-if="isWindows">&#xeeac;</i>
              <i class="iconfont-sys" v-else>&#xe9ab;</i>
              <span>k</span>
            </div>
          </div>
        </div>

        <!-- 全屏按钮 -->
        <div class="btn-box screen-box" v-if="shouldShowFullscreen" @click="toggleFullScreen">
          <div
            class="btn"
            :class="{ 'full-screen-btn': !isFullscreen, 'exit-full-screen-btn': isFullscreen }"
          >
            <i class="iconfont-sys">{{ isFullscreen ? '&#xe62d;' : '&#xe8ce;' }}</i>
          </div>
        </div>
        <!-- 设置 -->
        <div class="btn-box" v-if="shouldShowSettings" @click="openSetting">
          <ElPopover :visible="showSettingGuide" placement="bottom-start" :width="190" :offset="0">
            <template #reference>
              <div class="btn setting-btn">
                <i class="iconfont-sys">&#xe6d0;</i>
              </div>
            </template>
            <template #default>
              <p
                >{{ '点击这里查看'
                }}<span :style="{ color: systemThemeColor }"> {{ '主题风格' }} </span>、
                <span :style="{ color: systemThemeColor }"> {{ '开启顶栏菜单' }} </span
                >{{ '等更多配置' }}
              </p>
            </template>
          </ElPopover>
        </div>
        <!-- 切换主题 -->
        <div class="btn-box" v-if="shouldShowThemeToggle" @click="themeAnimation">
          <div class="btn theme-btn">
            <i class="iconfont-sys">{{ isDark ? '&#xe6b5;' : '&#xe725;' }}</i>
          </div>
        </div>

        <!-- 用户头像、菜单 -->
        <div class="user">
          <ElPopover
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
                    <span class="name">{{ displayName }}</span>
                    <span class="tenant" v-if="currentTenantCode">
                      <i class="iconfont-sys">&#xe604;</i>
                      {{ currentTenantName || currentTenantCode }}
                    </span>
                    <span class="email" v-if="userInfo.email">{{ userInfo.email }}</span>
                  </div>
                </div>
                <ul class="user-menu">
                  <li @click="lockScreen()">
                    <i class="menu-icon iconfont-sys">&#xe817;</i>
                    <span class="menu-txt">{{ '锁定屏幕' }}</span>
                  </li>
                  <li @click="openEditInfo()">
                    <i class="menu-icon iconfont-sys">&#xe6e0;</i>
                    <span class="menu-txt">{{ '修改个人信息' }}</span>
                  </li>
                  <div class="line"></div>
                  <div class="logout-btn" @click="loginOut">
                    {{ '退出登录' }}
                  </div>
                </ul>
              </div>
            </template>
          </ElPopover>
        </div>
      </div>
    </div>
    <ArtWorkTab />
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { useFullscreen, useWindowSize } from '@vueuse/core'
  import { MenuTypeEnum } from '@/enums/appEnum'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useMenuStore } from '@/store/modules/menu'
  import AppConfig from '@/config'
  import { mittBus } from '@/utils/sys'
  import { themeAnimation } from '@/utils/theme/animation'
  import { useCommon } from '@/composables/useCommon'
  import { useHeaderBar } from '@/composables/useHeaderBar'

  defineOptions({ name: 'ArtHeaderBar' })

  // 检测操作系统类型
  const isWindows = navigator.userAgent.includes('Windows')

  const router = useRouter()
  const { width } = useWindowSize()

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 顶部栏功能配置
  const {
    shouldShowMenuButton,
    shouldShowRefreshButton,
    shouldShowBreadcrumb,
    shouldShowGlobalSearch,
    shouldShowFullscreen,
    shouldShowSettings,
    shouldShowThemeToggle
  } = useHeaderBar()

  const { menuOpen, systemThemeColor, showSettingGuide, menuType, isDark, tabStyle } =
    storeToRefs(settingStore)

  const {
    getUserInfo: userInfo,
    getCurrentTenantCode: currentTenantCode,
    getTenantInfo: tenantInfo
  } = storeToRefs(userStore)
  const { menuList } = storeToRefs(menuStore)
  const userMenuPopover = ref()
  const userAvatarRef = ref<HTMLImageElement | null>(null)

  const currentTenantName = computed(() => tenantInfo.value?.name || '')
  const displayName = computed(
    () =>
      (userInfo.value?.userName ||
        userInfo.value?.username ||
        userInfo.value?.nickName ||
        userInfo.value?.email ||
        '未命名用户') as string
  )

  // 菜单类型判断
  const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT)
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)
  const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  /**
   * 切换全屏状态
   */
  const toggleFullScreen = (): void => {
    toggleFullscreen()
  }

  /**
   * 切换菜单显示/隐藏状态
   */
  const visibleMenu = (): void => {
    settingStore.setMenuOpen(!menuOpen.value)
  }

  /**
   * 跳转到首页
   */
  const toHome = (): void => {
    router.push(useCommon().homePath.value)
  }

  /**
   * 打开个人信息编辑
   */
  const openEditInfo = (): void => {
    closeUserMenu()
    nextTick(() => {
      userAvatarRef.value?.focus()
      mittBus.emit('openEditInfoDialog')
    })
  }

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
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

  /**
   * 刷新页面
   * @param {number} time - 延迟时间，默认为0毫秒
   */
  const reload = (time: number = 0): void => {
    setTimeout(() => {
      useCommon().refresh()
    }, time)
  }

  /**
   * 打开设置面板
   */
  const openSetting = (): void => {
    mittBus.emit('openSetting')

    // 隐藏设置引导提示
    if (showSettingGuide.value) {
      settingStore.hideSettingGuide()
    }
  }

  /**
   * 打开全局搜索对话框
   */
  const openSearchDialog = (): void => {
    mittBus.emit('openSearchDialog')
  }

  /**
   * 打开锁屏功能
   */
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      if (userMenuPopover.value && typeof userMenuPopover.value.hide === 'function') {
        userMenuPopover.value.hide()
      }
    }, 100)
  }
</script>

<style lang="scss" scoped>
  @use './style';
  @use './mobile';
</style>
