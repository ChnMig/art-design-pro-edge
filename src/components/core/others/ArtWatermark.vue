<!-- 全局水印组件 -->
<template>
  <div v-if="watermarkVisible" class="layout-watermark" :style="{ zIndex: zIndex }">
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
  import { useSettingStore } from '@/store/modules/setting'
  const settingStore = useSettingStore()
  const { watermarkVisible } = storeToRefs(settingStore)
  import { computed } from 'vue'
  import { useUserStore } from '@/store/modules/user'
  const userStore = useUserStore()

  interface WatermarkProps {
    content?: string
    visible?: boolean
    fontSize?: number
    fontColor?: string
    rotate?: number
    gapX?: number
    gapY?: number
    offsetX?: number
    offsetY?: number
    zIndex?: number
  }

  // 定义组件属性，设置默认值
  withDefaults(defineProps<WatermarkProps>(), {
    content: undefined,
    visible: true,
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
  const effectiveContent = computed(
    () => userStore.getUserInfo.id + ' | ' + userStore.getUserInfo.username
  )
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
