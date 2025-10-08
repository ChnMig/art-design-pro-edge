<!-- 水印组件 -->
<template>
  <div v-if="watermarkVisible" class="layout-watermark" :style="{ zIndex: zIndex }">
    <el-watermark
      :content="wmContent"
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
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'ArtWatermark' })

  const settingStore = useSettingStore()
  const { watermarkVisible } = storeToRefs(settingStore)
  const userStore = useUserStore()

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
    content: undefined,
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

  // 统一水印内容：优先使用传入的 content；否则显示 租户编码 | 用户账号；都缺失时回退系统名
  const wmContent = computed(() => {
    // 1) 显式传入
    if (props.content && String(props.content).trim()) return props.content as string

    // 2) 从用户状态拼接：tenant_code | account
    const tenantCode =
      (userStore.getTenantInfo as any)?.code || userStore.getCurrentTenantCode || ''
    const userInfo = userStore.getUserInfo as any
    const account = userInfo?.account || userInfo?.username || userInfo?.userName || ''

    const parts = [tenantCode, account].filter((s: string) => !!s)
    if (parts.length > 0) return parts.join(' | ')

    // 3) 兜底：系统名
    return AppConfig.systemInfo.name
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
