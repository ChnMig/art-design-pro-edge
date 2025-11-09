<template>
  <SectionTitle :title="'主题风格'" />
  <div class="setting-box-wrap">
    <div
      class="setting-item"
      v-for="(item, index) in configOptions.themeList"
      :key="item.theme"
      @click="switchThemeStyles(item.theme)"
    >
      <div class="box" :class="{ 'is-active': item.theme === systemThemeMode }">
        <img :src="item.img" />
      </div>
      <p class="name">{{ themeLabels[item.name] || `主题 ${index + 1}` }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import SectionTitle from './SectionTitle.vue'
  import { useSettingStore } from '@/store/modules/setting'
  import { useSettingsConfig } from '../composables/useSettingsConfig'
  import { useTheme } from '@/hooks/core/useTheme'

  const settingStore = useSettingStore()
  const { systemThemeMode } = storeToRefs(settingStore)
  const { configOptions } = useSettingsConfig()
  const { switchThemeStyles } = useTheme()

  const themeLabels: Record<string, string> = {
    Light: '明亮模式',
    Dark: '暗黑模式',
    System: '跟随系统'
  }
</script>
