<template>
  <SectionTitle title="主题风格" />
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import SectionTitle from './SectionTitle.vue'
  import { useSettingStore } from '@/store/modules/setting'
  import { useSettingsConfig } from '../composables/useSettingsConfig'
  import { useTheme } from '@/composables/useTheme'

  const settingStore = useSettingStore()
  const { systemThemeMode } = storeToRefs(settingStore)
  const { configOptions } = useSettingsConfig()
  const { switchThemeStyles } = useTheme()
</script>
