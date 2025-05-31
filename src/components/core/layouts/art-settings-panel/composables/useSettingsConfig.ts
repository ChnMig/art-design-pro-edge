import { computed } from 'vue'
import { ContainerWidthEnum } from '@/enums/appEnum'
import AppConfig from '@/config'

/**
 * 设置项配置选项管理
 */
export function useSettingsConfig() {
  // 标签页风格选项
  const tabStyleOptions = computed(() => [
    {
      value: 'tab-default',
      label: '默认'
    },
    {
      value: 'tab-card',
      label: '卡片'
    },
    {
      value: 'tab-google',
      label: 'Google'
    }
  ])

  // 页面切换动画选项
  const pageTransitionOptions = computed(() => [
    {
      value: '',
      label: '无'
    },
    {
      value: 'fade',
      label: '淡入淡出'
    },
    {
      value: 'slide-left',
      label: '左滑'
    },
    {
      value: 'slide-bottom',
      label: '上滑'
    },
    {
      value: 'slide-top',
      label: '下滑'
    }
  ])

  // 圆角大小选项
  const customRadiusOptions = [
    { value: '0', label: '0' },
    { value: '0.25', label: '0.25' },
    { value: '0.5', label: '0.5' },
    { value: '0.75', label: '0.75' },
    { value: '1', label: '1' }
  ]

  // 容器宽度选项
  const containerWidthOptions = computed(() => [
    {
      value: ContainerWidthEnum.FULL,
      label: '铺满',
      icon: '&#xe694;'
    },
    {
      value: ContainerWidthEnum.BOXED,
      label: '定宽',
      icon: '&#xe6de;'
    }
  ])

  // 盒子样式选项
  const boxStyleOptions = computed(() => [
    {
      value: 'border-mode',
      label: '边框',
      type: 'border-mode' as const
    },
    {
      value: 'shadow-mode',
      label: '阴影',
      type: 'shadow-mode' as const
    }
  ])

  // 从配置文件获取的选项
  const configOptions = {
    // 主题色彩选项
    mainColors: AppConfig.systemMainColor,

    // 主题风格选项
    themeList: AppConfig.settingThemeList,

    // 菜单布局选项
    menuLayoutList: AppConfig.menuLayoutList
  }

  // 基础设置项配置
  const basicSettingsConfig = computed(() => [
    {
      key: 'showWorkTab',
      label: '开启多标签栏',
      type: 'switch' as const,
      handler: 'workTab'
    },
    {
      key: 'uniqueOpened',
      label: '侧边栏开启手风琴模式',
      type: 'switch' as const,
      handler: 'uniqueOpened'
    },
    {
      key: 'showMenuButton',
      label: '显示折叠侧边栏按钮',
      type: 'switch' as const,
      handler: 'menuButton'
    },
    {
      key: 'showRefreshButton',
      label: '显示重载页面按钮',
      type: 'switch' as const,
      handler: 'refreshButton'
    },
    {
      key: 'showCrumbs',
      label: '显示全局面包屑导航',
      type: 'switch' as const,
      handler: 'crumbs',
      mobileHide: true
    },
    {
      key: 'showNprogress',
      label: '显示顶部进度条',
      type: 'switch' as const,
      handler: 'nprogress'
    },
    {
      key: 'colorWeak',
      label: '色弱模式',
      type: 'switch' as const,
      handler: 'colorWeak'
    },
    {
      key: 'menuOpenWidth',
      label: '菜单宽度',
      type: 'input-number' as const,
      handler: 'menuOpenWidth',
      min: 180,
      max: 320,
      step: 10,
      style: { width: '120px' },
      controlsPosition: 'right' as const
    },
    {
      key: 'tabStyle',
      label: '标签页风格',
      type: 'select' as const,
      handler: 'tabStyle',
      options: tabStyleOptions.value,
      style: { width: '120px' }
    },
    {
      key: 'pageTransition',
      label: '页面切换动画',
      type: 'select' as const,
      handler: 'pageTransition',
      options: pageTransitionOptions.value,
      style: { width: '120px' }
    },
    {
      key: 'customRadius',
      label: '自定义圆角',
      type: 'select' as const,
      handler: 'customRadius',
      options: customRadiusOptions,
      style: { width: '120px' }
    }
  ])

  return {
    // 选项配置
    tabStyleOptions,
    pageTransitionOptions,
    customRadiusOptions,
    containerWidthOptions,
    boxStyleOptions,
    configOptions,

    // 设置项配置
    basicSettingsConfig
  }
}
