/**
 * HTTP错误处理集成
 * 为axios请求提供统一的错误处理机制
 */

import type { AxiosError, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { handleNetworkError, handleApiError, handleAuthError, ErrorLevel, ErrorType } from './index'

/** HTTP状态码错误消息映射 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求的资源不存在',
  405: '请求方法不被允许',
  408: '请求超时',
  409: '请求冲突',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
}

/** 业务错误码消息映射 */
const BUSINESS_ERROR_MESSAGES: Record<string | number, string> = {
  1001: '用户名或密码错误',
  1002: '验证码错误',
  1003: '账户已被禁用',
  1004: '登录已过期，请重新登录',
  1005: '权限不足',
  2001: '参数验证失败',
  2002: '数据不存在',
  2003: '数据已存在',
  2004: '操作失败',
  3001: '系统繁忙，请稍后再试',
  3002: '服务暂不可用',
  3003: '网络连接异常'
}

/**
 * 获取错误消息
 */
function getErrorMessage(error: AxiosError): string {
  // 网络错误
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请检查网络连接'
    }
    if (error.code === 'NETWORK_ERROR') {
      return '网络连接异常，请检查网络设置'
    }
    return '网络连接失败，请稍后再试'
  }

  const { status, data } = error.response

  // 业务错误码优先
  if (data && (data.code || data.error_code)) {
    const code = data.code || data.error_code
    const businessMessage = BUSINESS_ERROR_MESSAGES[code]
    if (businessMessage) {
      return businessMessage
    }
    // 如果有业务错误消息，直接使用
    if (data.message || data.msg || data.error_message) {
      return data.message || data.msg || data.error_message
    }
  }

  // HTTP状态码错误
  const httpMessage = HTTP_STATUS_MESSAGES[status]
  if (httpMessage) {
    return httpMessage
  }

  // 通用错误消息
  if (data && (data.message || data.msg || data.error)) {
    return data.message || data.msg || data.error
  }

  return `请求失败 (${status})`
}

/**
 * 判断是否为权限错误
 */
function isAuthError(error: AxiosError): boolean {
  if (!error.response) return false

  const { status, data } = error.response

  // HTTP状态码
  if (status === 401 || status === 403) {
    return true
  }

  // 业务错误码
  if (data && (data.code || data.error_code)) {
    const code = data.code || data.error_code
    return [1001, 1003, 1004, 1005].includes(code)
  }

  return false
}

/**
 * 判断是否为网络错误
 */
function isNetworkError(error: AxiosError): boolean {
  return !error.response || error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR'
}

/**
 * 判断是否需要显示错误提示
 */
function shouldShowNotification(error: AxiosError, config?: any): boolean {
  // 如果请求配置中明确设置了不显示错误
  if (config && config.hideErrorMessage === true) {
    return false
  }

  // 401错误通常由路由守卫处理，不需要额外提示
  if (error.response?.status === 401) {
    return false
  }

  return true
}

/**
 * 处理HTTP请求错误
 */
export function handleHttpError(error: AxiosError) {
  const message = getErrorMessage(error)
  const url = error.config?.url
  const method = error.config?.method?.toUpperCase()
  const status = error.response?.status

  const additionalInfo = {
    url,
    details: {
      method,
      status,
      config: error.config,
      response: error.response?.data
    }
  }

  // 根据错误类型选择处理方式
  if (isNetworkError(error)) {
    return handleNetworkError({ ...error, message }, url, additionalInfo)
  } else if (isAuthError(error)) {
    return handleAuthError({ ...error, message }, url, additionalInfo)
  } else {
    return handleApiError({ ...error, message }, url, additionalInfo)
  }
}

/**
 * 处理HTTP响应错误（业务错误）
 */
export function handleHttpResponseError(response: AxiosResponse, showNotification: boolean = true) {
  const { data } = response

  if (!data || (!data.code && !data.error_code)) {
    return null
  }

  const code = data.code || data.error_code
  const message = data.message || data.msg || data.error_message || '业务处理失败'

  // 业务错误通常不是权限错误，除非明确标识
  const isAuth = [1001, 1003, 1004, 1005].includes(code)

  const additionalInfo = {
    url: response.config?.url,
    details: {
      code,
      response: data,
      config: response.config
    }
  }

  if (isAuth) {
    return handleAuthError({ code, message }, response.config?.url, additionalInfo)
  } else {
    return handleApiError({ code, message }, response.config?.url, additionalInfo)
  }
}

/**
 * 创建axios错误拦截器
 */
export function createAxiosErrorInterceptor() {
  return (error: AxiosError) => {
    // 处理错误
    const errorInfo = handleHttpError(error)

    // 如果需要显示通知且错误处理框架没有显示，则手动显示
    if (shouldShowNotification(error, error.config)) {
      const message = getErrorMessage(error)

      // 避免重复显示（错误处理框架已经显示了）
      // 这里可以根据实际需求调整逻辑
      if (error.response?.status !== 401) {
        ElMessage.error(message)
      }
    }

    return Promise.reject(error)
  }
}

/**
 * 创建axios响应拦截器
 */
export function createAxiosResponseInterceptor() {
  return {
    success: (response: AxiosResponse) => {
      // 检查业务错误
      const { data } = response

      if (data && (data.code || data.error_code)) {
        const code = data.code || data.error_code
        const successCodes = [0, 200, '0', '200', 'success']

        if (!successCodes.includes(code)) {
          // 业务错误，但HTTP状态码成功
          handleHttpResponseError(response)
          return Promise.reject(new Error(data.message || data.msg || '业务处理失败'))
        }
      }

      return response
    },
    error: createAxiosErrorInterceptor()
  }
}

/**
 * 重试机制配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 重试延迟（毫秒） */
  retryDelay: number
  /** 可重试的HTTP状态码 */
  retryableStatusCodes: number[]
  /** 可重试的错误码 */
  retryableErrorCodes: string[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: ['ECONNABORTED', 'NETWORK_ERROR']
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: AxiosError, config: RetryConfig): boolean {
  // 网络错误
  if (!error.response && config.retryableErrorCodes.includes(error.code || '')) {
    return true
  }

  // HTTP状态码
  if (error.response && config.retryableStatusCodes.includes(error.response.status)) {
    return true
  }

  return false
}

/**
 * 创建带重试的axios错误拦截器
 */
export function createAxiosRetryInterceptor(retryConfig: Partial<RetryConfig> = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }

  return async (error: AxiosError) => {
    const { config: requestConfig } = error

    // 如果没有请求配置或已达到最大重试次数，直接抛出错误
    if (!requestConfig || (requestConfig as any).__retryCount >= config.maxRetries) {
      return createAxiosErrorInterceptor()(error)
    }

    // 如果错误不可重试，直接抛出
    if (!isRetryableError(error, config)) {
      return createAxiosErrorInterceptor()(error)
    }

    // 增加重试计数
    ;(requestConfig as any).__retryCount = (requestConfig as any).__retryCount || 0
    ;(requestConfig as any).__retryCount++

    // 延迟重试
    await new Promise((resolve) => setTimeout(resolve, config.retryDelay))

    // 重新发送请求
    const axios = (error.config as any).__axios || error.config?.axios
    if (axios) {
      return axios(requestConfig)
    }

    return createAxiosErrorInterceptor()(error)
  }
}
