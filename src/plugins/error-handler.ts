/**
 * 全局错误处理插件初始化
 */

import type { App } from 'vue'
import {
  setErrorHandlerConfig,
  createVueErrorHandler,
  createUnhandledRejectionHandler,
  createGlobalErrorHandler
} from '@/utils/error'

/**
 * 初始化全局错误处理
 */
export function setupErrorHandler(app: App) {
  // 配置全局错误处理
  setErrorHandlerConfig({
    enableConsoleLog: import.meta.env.DEV, // 开发环境启用控制台日志
    enableUserNotification: true, // 启用用户提示
    enableReporting: import.meta.env.PROD, // 生产环境启用错误上报
    reportingApiUrl: import.meta.env.VITE_API_URL + '/system/error/report', // 错误上报API
    maxErrorCacheSize: 50, // 最大错误缓存数量
    notificationDedupeInterval: 3000 // 通知去重间隔3秒
  })

  // Vue错误处理
  app.config.errorHandler = createVueErrorHandler()

  // 全局Promise错误处理
  window.addEventListener('unhandledrejection', createUnhandledRejectionHandler())

  // 全局JavaScript错误处理
  window.addEventListener('error', createGlobalErrorHandler())

  // 资源加载错误处理
  window.addEventListener('error', (event) => {
    // 只处理资源加载错误
    if (event.target !== window && (event.target as any)?.tagName) {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      const src = (target as any).src || (target as any).href
      
      console.error(`资源加载失败: ${tagName}`, {
        src,
        tagName,
        message: event.message || `${tagName} 资源加载失败`
      })
    }
  }, true) // 使用捕获阶段

  console.log('✅ 全局错误处理已初始化')
}

/**
 * Vue插件安装函数
 */
export default {
  install(app: App) {
    setupErrorHandler(app)
  }
}