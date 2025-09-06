/**
 * 全局错误处理框架
 * 提供统一的错误处理、日志记录和用户提示机制
 */

import { ElMessage, ElMessageBox } from 'element-plus'

/** 错误级别枚举 */
export enum ErrorLevel {
  /** 信息级别 - 仅记录日志 */
  INFO = 'info',
  /** 警告级别 - 显示警告提示 */
  WARN = 'warn',
  /** 错误级别 - 显示错误提示 */
  ERROR = 'error',
  /** 致命级别 - 显示致命错误对话框 */
  FATAL = 'fatal'
}

/** 错误类型枚举 */
export enum ErrorType {
  /** 网络错误 */
  NETWORK = 'network',
  /** API错误 */
  API = 'api',
  /** 权限错误 */
  AUTH = 'auth',
  /** 验证错误 */
  VALIDATION = 'validation',
  /** 业务逻辑错误 */
  BUSINESS = 'business',
  /** 系统错误 */
  SYSTEM = 'system',
  /** 未知错误 */
  UNKNOWN = 'unknown'
}

/** 错误信息接口 */
export interface ErrorInfo {
  /** 错误代码 */
  code?: string | number
  /** 错误消息 */
  message: string
  /** 错误级别 */
  level: ErrorLevel
  /** 错误类型 */
  type: ErrorType
  /** 错误详情 */
  details?: any
  /** 错误堆栈 */
  stack?: string
  /** 发生时间 */
  timestamp?: number
  /** 用户ID */
  userId?: string | number
  /** 请求URL */
  url?: string
  /** 用户代理 */
  userAgent?: string
}

/** 错误处理器配置 */
export interface ErrorHandlerConfig {
  /** 是否启用控制台日志 */
  enableConsoleLog?: boolean
  /** 是否启用用户提示 */
  enableUserNotification?: boolean
  /** 是否启用错误上报 */
  enableReporting?: boolean
  /** 错误上报API地址 */
  reportingApiUrl?: string
  /** 最大错误缓存数量 */
  maxErrorCacheSize?: number
  /** 用户提示去重时间间隔（毫秒） */
  notificationDedupeInterval?: number
}

/** 默认配置 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableConsoleLog: true,
  enableUserNotification: true,
  enableReporting: false,
  maxErrorCacheSize: 100,
  notificationDedupeInterval: 5000
}

/** 错误缓存 */
const errorCache: ErrorInfo[] = []
/** 通知去重缓存 */
const notificationCache = new Map<string, number>()

/** 全局配置 */
let globalConfig: ErrorHandlerConfig = { ...DEFAULT_CONFIG }

/**
 * 设置全局错误处理配置
 */
export function setErrorHandlerConfig(config: Partial<ErrorHandlerConfig>) {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 获取全局错误处理配置
 */
export function getErrorHandlerConfig(): ErrorHandlerConfig {
  return { ...globalConfig }
}

/**
 * 格式化错误信息
 */
export function formatErrorInfo(
  error: Error | string | any,
  level: ErrorLevel = ErrorLevel.ERROR,
  type: ErrorType = ErrorType.UNKNOWN,
  additionalInfo?: Partial<ErrorInfo>
): ErrorInfo {
  const timestamp = Date.now()
  let message: string
  let stack: string | undefined
  let code: string | number | undefined

  if (error instanceof Error) {
    message = error.message || '未知错误'
    stack = error.stack
    code = (error as any).code
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    message = error.message || error.msg || JSON.stringify(error)
    code = error.code || error.status
    stack = error.stack
  } else {
    message = '未知错误'
  }

  return {
    code,
    message,
    level,
    type,
    stack,
    timestamp,
    userAgent: navigator.userAgent,
    ...additionalInfo
  }
}

/**
 * 记录错误到控制台
 */
function logToConsole(errorInfo: ErrorInfo) {
  if (!globalConfig.enableConsoleLog) return

  const { level, message, code, type, timestamp, stack, details } = errorInfo
  const time = new Date(timestamp || Date.now()).toISOString()
  const prefix = `[${time}] [${level.toUpperCase()}] [${type.toUpperCase()}]`

  const logData = {
    message,
    code,
    details,
    stack
  }

  switch (level) {
    case ErrorLevel.INFO:
      console.info(prefix, logData)
      break
    case ErrorLevel.WARN:
      console.warn(prefix, logData)
      break
    case ErrorLevel.ERROR:
      console.error(prefix, logData)
      break
    case ErrorLevel.FATAL:
      console.error(prefix, logData)
      break
  }
}

/**
 * 显示用户通知
 */
function showUserNotification(errorInfo: ErrorInfo) {
  if (!globalConfig.enableUserNotification) return

  const { level, message, type } = errorInfo
  const now = Date.now()
  const cacheKey = `${type}-${message}`
  const lastNotification = notificationCache.get(cacheKey)

  // 去重检查
  if (
    lastNotification &&
    now - lastNotification < (globalConfig.notificationDedupeInterval || 5000)
  ) {
    return
  }

  notificationCache.set(cacheKey, now)

  switch (level) {
    case ErrorLevel.INFO:
      ElMessage.info(message)
      break
    case ErrorLevel.WARN:
      ElMessage.warning(message)
      break
    case ErrorLevel.ERROR:
      ElMessage.error(message)
      break
    case ErrorLevel.FATAL:
      ElMessageBox.alert(message, '系统错误', {
        type: 'error',
        confirmButtonText: '确定'
      })
      break
  }
}

/**
 * 上报错误到服务器
 */
async function reportError(errorInfo: ErrorInfo) {
  if (!globalConfig.enableReporting || !globalConfig.reportingApiUrl) return

  try {
    await fetch(globalConfig.reportingApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorInfo)
    })
  } catch (err) {
    console.warn('错误上报失败:', err)
  }
}

/**
 * 缓存错误信息
 */
function cacheError(errorInfo: ErrorInfo) {
  errorCache.push(errorInfo)

  // 控制缓存大小
  const maxSize = globalConfig.maxErrorCacheSize || 100
  if (errorCache.length > maxSize) {
    errorCache.splice(0, errorCache.length - maxSize)
  }
}

/**
 * 处理错误
 */
export function handleError(
  error: Error | string | any,
  level: ErrorLevel = ErrorLevel.ERROR,
  type: ErrorType = ErrorType.UNKNOWN,
  additionalInfo?: Partial<ErrorInfo>
) {
  const errorInfo = formatErrorInfo(error, level, type, additionalInfo)

  // 缓存错误
  cacheError(errorInfo)

  // 记录日志
  logToConsole(errorInfo)

  // 显示用户通知
  showUserNotification(errorInfo)

  // 上报错误
  reportError(errorInfo)

  return errorInfo
}

/**
 * 处理网络错误
 */
export function handleNetworkError(
  error: any,
  url?: string,
  additionalInfo?: Partial<ErrorInfo>
) {
  return handleError(error, ErrorLevel.ERROR, ErrorType.NETWORK, {
    url,
    ...additionalInfo
  })
}

/**
 * 处理API错误
 */
export function handleApiError(
  error: any,
  url?: string,
  additionalInfo?: Partial<ErrorInfo>
) {
  return handleError(error, ErrorLevel.ERROR, ErrorType.API, {
    url,
    ...additionalInfo
  })
}

/**
 * 处理权限错误
 */
export function handleAuthError(
  error: any,
  url?: string,
  additionalInfo?: Partial<ErrorInfo>
) {
  return handleError(error, ErrorLevel.ERROR, ErrorType.AUTH, {
    url,
    ...additionalInfo
  })
}

/**
 * 处理验证错误
 */
export function handleValidationError(
  error: any,
  additionalInfo?: Partial<ErrorInfo>
) {
  return handleError(error, ErrorLevel.WARN, ErrorType.VALIDATION, additionalInfo)
}

/**
 * 处理业务错误
 */
export function handleBusinessError(
  error: any,
  additionalInfo?: Partial<ErrorInfo>
) {
  return handleError(error, ErrorLevel.ERROR, ErrorType.BUSINESS, additionalInfo)
}

/**
 * 处理系统错误
 */
export function handleSystemError(
  error: any,
  additionalInfo?: Partial<ErrorInfo>
) {
  return handleError(error, ErrorLevel.FATAL, ErrorType.SYSTEM, additionalInfo)
}

/**
 * 获取错误历史
 */
export function getErrorHistory(
  limit?: number,
  level?: ErrorLevel,
  type?: ErrorType
): ErrorInfo[] {
  let filtered = errorCache

  if (level) {
    filtered = filtered.filter((error) => error.level === level)
  }

  if (type) {
    filtered = filtered.filter((error) => error.type === type)
  }

  if (limit) {
    filtered = filtered.slice(-limit)
  }

  return [...filtered]
}

/**
 * 清空错误历史
 */
export function clearErrorHistory() {
  errorCache.length = 0
  notificationCache.clear()
}

/**
 * 创建错误边界装饰器（用于组合式函数）
 */
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: any) => void,
  level: ErrorLevel = ErrorLevel.ERROR,
  type: ErrorType = ErrorType.UNKNOWN
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args)
      
      // 如果返回Promise，处理async错误
      if (result instanceof Promise) {
        return result.catch((error) => {
          const errorInfo = handleError(error, level, type)
          if (errorHandler) {
            errorHandler(errorInfo)
          }
          throw error
        })
      }
      
      return result
    } catch (error) {
      const errorInfo = handleError(error, level, type)
      if (errorHandler) {
        errorHandler(errorInfo)
      }
      throw error
    }
  }) as T
}

/**
 * Vue错误处理器
 */
export function createVueErrorHandler() {
  return (error: any, instance: any, info: string) => {
    handleError(error, ErrorLevel.ERROR, ErrorType.SYSTEM, {
      details: { instance, info },
      message: `Vue错误: ${error.message || error}`
    })
  }
}

/**
 * Promise未捕获错误处理器
 */
export function createUnhandledRejectionHandler() {
  return (event: PromiseRejectionEvent) => {
    handleError(event.reason, ErrorLevel.ERROR, ErrorType.SYSTEM, {
      message: `未捕获的Promise错误: ${event.reason?.message || event.reason}`
    })
  }
}

/**
 * 全局错误处理器
 */
export function createGlobalErrorHandler() {
  return (event: ErrorEvent) => {
    handleError(event.error || event.message, ErrorLevel.ERROR, ErrorType.SYSTEM, {
      url: event.filename,
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  }
}