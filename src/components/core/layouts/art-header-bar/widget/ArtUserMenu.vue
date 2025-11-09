<!-- 用户菜单 -->
<template>
  <ElPopover
    ref="userMenuPopover"
    placement="bottom-end"
    :width="240"
    :hide-after="0"
    :offset="10"
    trigger="hover"
    :show-arrow="false"
    popper-class="user-menu-popover"
    popper-style="padding: 5px 16px;"
  >
    <template #reference>
      <img
        class="size-8.5 mr-5 c-p rounded-full max-sm:w-6.5 max-sm:h-6.5 max-sm:mr-[16px]"
        :src="avatarSrc"
        alt="avatar"
      />
    </template>
    <template #default>
      <div class="pt-3">
        <div class="flex-c pb-1 px-0">
          <img
            class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left"
            :src="avatarSrc"
          />
          <div class="w-[calc(100%-60px)] h-full">
            <span class="block text-sm font-medium text-g-800 truncate">{{ displayName }}</span>
            <span
              v-if="tenantDisplay"
              class="block mt-0.5 text-xs text-g-500 truncate"
              :title="tenantDisplay"
            >
              租户：{{ tenantDisplay }}
            </span>
            <span
              v-if="accountDisplay"
              class="block mt-0.5 text-xs text-g-500 truncate"
              :title="accountDisplay"
            >
              账号：{{ accountDisplay }}
            </span>
            <span
              v-if="userInfo.email"
              class="block mt-0.5 text-xs text-g-500 truncate"
              :title="userInfo.email"
            >
              {{ userInfo.email }}
            </span>
          </div>
        </div>
        <ul class="py-4 mt-3 border-t border-g-300/80">
          <li class="btn-item" @click="editUserInfo">
            <ArtSvgIcon icon="ri:user-settings-line" />
            <span>修改个人信息</span>
          </li>
          <li class="btn-item" @click="lockScreen()">
            <ArtSvgIcon icon="ri:lock-line" />
            <span>锁屏</span>
          </li>
          <div class="w-full h-px my-2 bg-g-300/80"></div>
          <div class="log-out c-p" @click="loginOut">退出登录</div>
        </ul>
      </div>
    </template>
  </ElPopover>
</template>

<script setup lang="ts">
  import { ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { mittBus } from '@/utils/sys'
  import defaultAvatar from '@imgs/user/avatar.webp'

  defineOptions({ name: 'ArtUserMenu' })

  const userStore = useUserStore()

  const { getUserInfo: userInfo, getTenantInfo, getCurrentTenantCode } = storeToRefs(userStore)
  const userMenuPopover = ref()

  const avatarSrc = computed(() => userInfo.value?.avatar || defaultAvatar)

  const displayName = computed(() => {
    const info = userInfo.value || {}
    return (
      info.userName || info.username || info.nickName || info.account || info.email || '未命名用户'
    )
  })

  const tenantDisplay = computed(() => {
    const tenant = getTenantInfo.value
    const code = tenant?.code || tenant?.tenantCode || getCurrentTenantCode.value || ''
    const name = tenant?.name || ''
    if (code && name) return `${code} - ${name}`
    return code || name || ''
  })

  const accountDisplay = computed(() => {
    const info = userInfo.value
    return info?.account || info?.username || info?.userName || ''
  })

  const editUserInfo = () => {
    closeUserMenu()
    mittBus.emit('openEditInfoDialog')
  }

  /**
   * 打开锁屏功能
   */
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      userMenuPopover.value.hide()
    }, 100)
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  @layer components {
    .btn-item {
      @apply flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0;

      span {
        @apply text-sm;
      }

      .art-svg-icon {
        @apply mr-2 text-base;
      }

      &:hover {
        background-color: var(--art-gray-200);
      }
    }
  }

  .log-out {
    @apply py-1.5
    mt-5
    text-xs
    text-center
    border
    border-g-400
    rounded-md
    transition-all
    duration-200
    hover:shadow-xl;
  }
</style>
