/**
 * 全局异步组件插件
 * 为常用组件提供异步加载支持
 */

import type { App } from 'vue'
import {
  createAsyncComponent,
  createAsyncPage,
  preloadComponents,
  type AsyncComponentOptions
} from '@/utils/components/async-loader'

/** 全局异步组件配置 */
export interface AsyncComponentsConfig {
  /** 是否预加载核心组件 */
  preloadCore?: boolean
  /** 是否预加载表格相关组件 */
  preloadTable?: boolean
  /** 是否预加载表单相关组件 */
  preloadForm?: boolean
  /** 默认异步组件选项 */
  defaultOptions?: AsyncComponentOptions
}

/**
 * 注册全局异步组件
 */
export function setupAsyncComponents(app: App, config: AsyncComponentsConfig = {}) {
  const {
    preloadCore = true,
    preloadTable = false,
    preloadForm = false,
    defaultOptions = {}
  } = config

  // 默认配置
  const baseOptions: AsyncComponentOptions = {
    delay: 200,
    timeout: 10000,
    showErrorMessage: false,
    retryable: true,
    maxRetries: 2,
    retryDelay: 1000,
    cache: true,
    ...defaultOptions
  }

  // ============ 表格相关组件 ============

  /** ArtTable 异步组件 */
  const ArtTable = createAsyncComponent(
    () => import('@/components/core/tables/art-table/index.vue'),
    { ...baseOptions, cacheKey: 'ArtTable' }
  )

  /** ArtTableHeader 异步组件 */
  const ArtTableHeader = createAsyncComponent(
    () => import('@/components/core/tables/art-table-header/index.vue'),
    { ...baseOptions, cacheKey: 'ArtTableHeader' }
  )

  // ============ 表单相关组件 ============

  /** ArtSearchBar 异步组件 */
  const ArtSearchBar = createAsyncComponent(
    () => import('@/components/core/forms/art-search-bar/index.vue'),
    { ...baseOptions, cacheKey: 'ArtSearchBar' }
  )

  /** ArtButtonMore 异步组件 */
  const ArtButtonMore = createAsyncComponent(
    () => import('@/components/core/forms/art-button-more/index.vue'),
    { ...baseOptions, cacheKey: 'ArtButtonMore' }
  )

  // ============ 视图组件 ============

  /** ArtWaterMark 异步组件 */
  const ArtWaterMark = createAsyncComponent(
    () => import('@/components/core/others/art-water-mark/index.vue'),
    { ...baseOptions, cacheKey: 'ArtWaterMark' }
  )

  // ============ 页面异步组件 ============

  /** 用户管理页面 */
  const UserManagePage = createAsyncPage(() => import('@/views/system/user/index.vue'), {
    ...baseOptions,
    cacheKey: 'UserManagePage',
    timeout: 15000
  })

  /** 角色管理页面 */
  const RoleManagePage = createAsyncPage(() => import('@/views/system/role/index.vue'), {
    ...baseOptions,
    cacheKey: 'RoleManagePage',
    timeout: 15000
  })

  /** 菜单管理页面 */
  const MenuManagePage = createAsyncPage(() => import('@/views/system/menu/index.vue'), {
    ...baseOptions,
    cacheKey: 'MenuManagePage',
    timeout: 15000
  })

  // ============ 注册全局组件 ============

  // 表格相关组件
  app.component('ArtTable', ArtTable)
  app.component('ArtTableHeader', ArtTableHeader)

  // 表单相关组件
  app.component('ArtSearchBar', ArtSearchBar)
  app.component('ArtButtonMore', ArtButtonMore)

  // 视图组件
  app.component('ArtWaterMark', ArtWaterMark)

  // ============ 预加载组件 ============

  const preloadTasks: Array<{ loader: () => Promise<any>; cacheKey: string }> = []

  // 核心组件预加载
  if (preloadCore) {
    preloadTasks.push({
      loader: () => import('@/components/core/others/art-water-mark/index.vue'),
      cacheKey: 'ArtWaterMark'
    })
  }

  // 表格组件预加载
  if (preloadTable) {
    preloadTasks.push(
      {
        loader: () => import('@/components/core/tables/art-table/index.vue'),
        cacheKey: 'ArtTable'
      },
      {
        loader: () => import('@/components/core/tables/art-table-header/index.vue'),
        cacheKey: 'ArtTableHeader'
      }
    )
  }

  // 表单组件预加载
  if (preloadForm) {
    preloadTasks.push(
      {
        loader: () => import('@/components/core/forms/art-search-bar/index.vue'),
        cacheKey: 'ArtSearchBar'
      },
      {
        loader: () => import('@/components/core/forms/art-button-more/index.vue'),
        cacheKey: 'ArtButtonMore'
      }
    )
  }

  // 执行预加载
  if (preloadTasks.length > 0) {
    preloadComponents(preloadTasks)
      .then(() => {
        console.log(`✅ 预加载完成 ${preloadTasks.length} 个组件`)
      })
      .catch((error) => {
        console.warn('⚠️  部分组件预加载失败:', error)
      })
  }

  console.log('✅ 全局异步组件已注册')
}

/**
 * Vue插件安装函数
 */
export default {
  install(app: App, options?: AsyncComponentsConfig) {
    setupAsyncComponents(app, options)
  }
}

// ============ 导出便捷方法 ============

/**
 * 创建业务页面异步组件
 */
export function createBusinessPage(importFn: () => Promise<any>, pageName?: string) {
  return createAsyncPage(importFn, {
    delay: 300,
    timeout: 20000,
    showErrorMessage: true,
    errorMessage: `${pageName || '页面'}加载失败，请刷新重试`,
    retryable: true,
    maxRetries: 3,
    cache: true
  })
}

/**
 * 创建业务组件异步组件
 */
export function createBusinessComponent(importFn: () => Promise<any>) {
  return createAsyncComponent(importFn, {
    delay: 100,
    timeout: 8000,
    showErrorMessage: false,
    retryable: true,
    maxRetries: 2,
    cache: true
  })
}

/**
 * 创建表单对话框异步组件
 */
export function createFormDialog(importFn: () => Promise<any>, dialogName?: string) {
  return createAsyncComponent(importFn, {
    delay: 0,
    timeout: 5000,
    showErrorMessage: true,
    errorMessage: `${dialogName || '对话框'}加载失败`,
    retryable: true,
    maxRetries: 2,
    cache: true
  })
}
