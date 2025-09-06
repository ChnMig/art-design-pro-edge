/**
 * 全局组件异步加载器
 * 提供组件懒加载、预加载、缓存和错误处理功能
 */

import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import { ElMessage } from 'element-plus'

/** 异步组件配置选项 */
export interface AsyncComponentOptions {
  /** 延迟加载时间（毫秒） */
  delay?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否可重试 */
  retryable?: boolean
  /** 最大重试次数 */
  maxRetries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 加载中组件 */
  loadingComponent?: Component
  /** 错误组件 */
  errorComponent?: Component
  /** 是否显示错误提示 */
  showErrorMessage?: boolean
  /** 错误提示文案 */
  errorMessage?: string
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存键名 */
  cacheKey?: string
}

/** 默认配置 */
const DEFAULT_OPTIONS: Required<
  Omit<AsyncComponentOptions, 'loadingComponent' | 'errorComponent' | 'cacheKey'>
> = {
  delay: 200,
  timeout: 30000,
  retryable: true,
  maxRetries: 3,
  retryDelay: 1000,
  showErrorMessage: true,
  errorMessage: '组件加载失败',
  cache: true
}

/** 组件缓存 */
const componentCache = new Map<string, Component>()

/** 加载状态缓存 */
const loadingStatus = new Map<string, 'loading' | 'loaded' | 'error'>()

/** 重试计数缓存 */
const retryCount = new Map<string, number>()

/**
 * 创建异步组件加载器
 */
export function createAsyncComponentLoader(
  loader: AsyncComponentLoader,
  options: AsyncComponentOptions = {}
): Component {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const cacheKey = options.cacheKey || generateCacheKey(loader.toString())

  // 如果启用缓存且已缓存，直接返回
  if (config.cache && componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!
  }

  // 创建带重试的加载器
  const loaderWithRetry = createRetryableLoader(loader, config, cacheKey)

  // 创建异步组件
  const asyncComponent = defineAsyncComponent({
    loader: loaderWithRetry,
    delay: config.delay,
    timeout: config.timeout,
    loadingComponent: config.loadingComponent || createDefaultLoadingComponent(),
    errorComponent: config.errorComponent || createDefaultErrorComponent(),
    onError: (error, retry, fail, attempts) => {
      handleAsyncComponentError(error, retry, fail, attempts, config, cacheKey)
    }
  })

  // 缓存组件
  if (config.cache) {
    componentCache.set(cacheKey, asyncComponent)
  }

  return asyncComponent
}

/**
 * 创建可重试的加载器
 */
function createRetryableLoader(
  originalLoader: AsyncComponentLoader,
  config: Required<Omit<AsyncComponentOptions, 'loadingComponent' | 'errorComponent' | 'cacheKey'>>,
  cacheKey: string
): AsyncComponentLoader {
  return async () => {
    const currentRetry = retryCount.get(cacheKey) || 0

    try {
      loadingStatus.set(cacheKey, 'loading')
      const component = await originalLoader()

      // 加载成功，重置重试计数
      retryCount.delete(cacheKey)
      loadingStatus.set(cacheKey, 'loaded')

      return component
    } catch (error) {
      loadingStatus.set(cacheKey, 'error')

      if (config.retryable && currentRetry < config.maxRetries) {
        // 增加重试计数
        retryCount.set(cacheKey, currentRetry + 1)

        // 延迟后重试
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay))

        console.warn(`组件加载失败，正在重试... (${currentRetry + 1}/${config.maxRetries})`, error)

        // 递归重试
        return createRetryableLoader(originalLoader, config, cacheKey)()
      } else {
        // 达到最大重试次数，抛出错误
        console.error('组件加载失败，已达到最大重试次数:', error)
        throw error
      }
    }
  }
}

/**
 * 处理异步组件错误
 */
function handleAsyncComponentError(
  error: Error,
  retry: () => void,
  fail: () => void,
  attempts: number,
  config: Required<Omit<AsyncComponentOptions, 'loadingComponent' | 'errorComponent' | 'cacheKey'>>,
  cacheKey: string
) {
  console.error(`异步组件加载错误 (尝试 ${attempts} 次):`, error)

  // 显示错误消息
  if (config.showErrorMessage) {
    ElMessage.error(config.errorMessage)
  }

  // 如果允许重试且未达到最大次数
  if (config.retryable && attempts <= config.maxRetries) {
    setTimeout(() => {
      console.log(`重新加载组件... (${attempts}/${config.maxRetries})`)
      retry()
    }, config.retryDelay)
  } else {
    // 清理缓存状态
    retryCount.delete(cacheKey)
    loadingStatus.delete(cacheKey)
    fail()
  }
}

/**
 * 生成缓存键
 */
function generateCacheKey(loaderString: string): string {
  // 简单的hash生成
  let hash = 0
  for (let i = 0; i < loaderString.length; i++) {
    const char = loaderString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转为32位整数
  }
  return `async_component_${Math.abs(hash)}`
}

/**
 * 创建默认加载组件
 */
function createDefaultLoadingComponent(): Component {
  return {
    template: `
      <div class="async-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    `,
    style: `
      .async-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: var(--el-text-color-secondary);
      }
      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--el-border-color);
        border-top-color: var(--el-color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 12px;
      }
      .loading-text {
        font-size: 14px;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
  }
}

/**
 * 创建默认错误组件
 */
function createDefaultErrorComponent(): Component {
  return {
    template: `
      <div class="async-error">
        <div class="error-icon">⚠️</div>
        <div class="error-text">组件加载失败</div>
        <button class="error-retry" @click="retry">重试</button>
      </div>
    `,
    methods: {
      retry() {
        window.location.reload()
      }
    },
    style: `
      .async-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: var(--el-color-error);
      }
      .error-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }
      .error-text {
        font-size: 14px;
        margin-bottom: 16px;
      }
      .error-retry {
        padding: 6px 12px;
        background: var(--el-color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .error-retry:hover {
        background: var(--el-color-primary-light-3);
      }
    `
  }
}

/**
 * 预加载组件
 */
export function preloadComponent(
  loader: AsyncComponentLoader,
  cacheKey?: string
): Promise<Component> {
  const key = cacheKey || generateCacheKey(loader.toString())

  // 如果已缓存，直接返回
  if (componentCache.has(key)) {
    return Promise.resolve(componentCache.get(key)!)
  }

  // 如果正在加载，等待加载完成
  if (loadingStatus.get(key) === 'loading') {
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const status = loadingStatus.get(key)
        if (status === 'loaded' && componentCache.has(key)) {
          resolve(componentCache.get(key)!)
        } else if (status === 'error') {
          reject(new Error('组件预加载失败'))
        } else {
          setTimeout(checkStatus, 100)
        }
      }
      checkStatus()
    })
  }

  // 开始预加载
  loadingStatus.set(key, 'loading')

  return loader()
    .then((component) => {
      componentCache.set(key, component)
      loadingStatus.set(key, 'loaded')
      return component
    })
    .catch((error) => {
      loadingStatus.delete(key)
      throw error
    })
}

/**
 * 批量预加载组件
 */
export function preloadComponents(
  loaders: { loader: AsyncComponentLoader; cacheKey?: string }[]
): Promise<Component[]> {
  return Promise.all(loaders.map(({ loader, cacheKey }) => preloadComponent(loader, cacheKey)))
}

/**
 * 清理组件缓存
 */
export function clearComponentCache(cacheKey?: string) {
  if (cacheKey) {
    componentCache.delete(cacheKey)
    loadingStatus.delete(cacheKey)
    retryCount.delete(cacheKey)
  } else {
    componentCache.clear()
    loadingStatus.clear()
    retryCount.clear()
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return {
    cacheSize: componentCache.size,
    loadingCount: Array.from(loadingStatus.values()).filter((status) => status === 'loading')
      .length,
    loadedCount: Array.from(loadingStatus.values()).filter((status) => status === 'loaded').length,
    errorCount: Array.from(loadingStatus.values()).filter((status) => status === 'error').length
  }
}

// ============ 便捷方法 ============

/**
 * 创建页面异步加载器
 */
export function createAsyncPage(
  loader: AsyncComponentLoader,
  options?: AsyncComponentOptions
): Component {
  return createAsyncComponentLoader(loader, {
    delay: 300,
    timeout: 15000,
    showErrorMessage: true,
    errorMessage: '页面加载失败，请刷新重试',
    ...options
  })
}

/**
 * 创建组件异步加载器
 */
export function createAsyncComponent(
  loader: AsyncComponentLoader,
  options?: AsyncComponentOptions
): Component {
  return createAsyncComponentLoader(loader, {
    delay: 100,
    timeout: 10000,
    showErrorMessage: false,
    ...options
  })
}

/**
 * 创建模态框异步加载器
 */
export function createAsyncModal(
  loader: AsyncComponentLoader,
  options?: AsyncComponentOptions
): Component {
  return createAsyncComponentLoader(loader, {
    delay: 0,
    timeout: 8000,
    showErrorMessage: true,
    errorMessage: '模态框加载失败',
    ...options
  })
}
