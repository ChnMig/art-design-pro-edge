<!-- 水印组件 -->
<template>
  <div class="layout-watermark" :style="{ zIndex: zIndex }">
    <el-watermark
      :content="effectiveContent"
      :font="{ fontSize: fontSize, color: fontColor }"
      :rotate="rotate"
      :gap="[gapX, gapY]"
      :offset="[offsetX, offsetY]"
    >
      <div style="height: 100vh"></div>
    </el-watermark>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { useUserStore } from '@/store/modules/user'
  const userStore = useUserStore()

  defineOptions({ name: 'ArtWatermark' })

  interface WatermarkProps {
    /** 水印内容 */
    content?: string
    /** 水印是否可见 */
    visible?: boolean
    /** 水印字体大小 */
    fontSize?: number
    /** 水印字体颜色 */
    fontColor?: string
    /** 水印旋转角度 */
    rotate?: number
    /** 水印间距X */
    gapX?: number
    /** 水印间距Y */
    gapY?: number
    /** 水印偏移X */
    offsetX?: number
    /** 水印偏移Y */
    offsetY?: number
    /** 水印层级 */
    zIndex?: number
  }

  const props = withDefaults(defineProps<WatermarkProps>(), {
    content: AppConfig.systemInfo.name,
    visible: false,
    fontSize: 16,
    fontColor: 'rgba(128, 128, 128, 0.2)',
    rotate: -22,
    gapX: 100,
    gapY: 100,
    offsetX: 50,
    offsetY: 50,
    zIndex: 3100
  })

  // 添加计算属性处理默认值
  const effectiveContent = computed(() => {
    const userInfo = userStore.getUserInfo
    const tenantInfo = userStore.getTenantInfo
    const tenantCode = userStore.getCurrentTenantCode
    console.log('Water mark user info:', userInfo)
    console.log('Water mark tenant info:', tenantInfo)

    // 尝试多种字段名组合，兼容不同后端数据格式
    const userId = userInfo.userId || userInfo.id || userInfo.user_id || ''
    const userName =
      userInfo.userName || userInfo.username || userInfo.name || userInfo.user_name || ''

    // 租户信息
    const currentTenant = tenantInfo.name || tenantCode || 'default'

    console.log('Water mark userId:', userId, 'userName:', userName, 'tenant:', currentTenant)

    // 如果没有用户信息，显示默认内容
    if (!userId && !userName) {
      return props.content || AppConfig.systemInfo.name
    }

    // 包含租户信息的水印格式：租户 | 用户ID | 用户名
    return `${currentTenant} | ${userId} | ${userName}`
  })
</script>

<style lang="scss" scoped>
  .layout-watermark {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }
</style>
