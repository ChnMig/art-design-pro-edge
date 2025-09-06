import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { ApiStatus } from './status'

// 错误响应接口
export interface ErrorResponse {
  code: number
  status?: string
  message: string // API返回的错误消息字段
  data?: unknown
  timestamp?: number
}

// 错误日志数据接口
export interface ErrorLogData {
  code: number
  message: string
  data?: unknown
  timestamp: string
  url?: string
  method?: string
  stack?: string
}

// 自定义 HttpError 类
export class HttpError extends Error {
  public readonly code: number
  public readonly data?: unknown
  public readonly timestamp: string
  public readonly url?: string
  public readonly method?: string

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown
      url?: string
      method?: string
    }
  ) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = options?.data
    this.timestamp = new Date().toISOString()
    this.url = options?.url
    this.method = options?.method
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack
    }
  }
}

/**
 * 获取错误消息
 * @param status 错误状态码
 * @returns 错误消息
 */
const getErrorMessage = (status: number): string => {
  const errorMap: Record<number, string> = {
    [ApiStatus.unauthorized]: '未授权，请重新登录',
    [ApiStatus.forbidden]: '拒绝访问',
    [ApiStatus.notFound]: '请求的资源不存在',
    [ApiStatus.methodNotAllowed]: '请求方法不被允许',
    [ApiStatus.requestTimeout]: '请求超时',
    [ApiStatus.internalServerError]: '服务器内部错误',
    [ApiStatus.badGateway]: '网关错误',
    [ApiStatus.serviceUnavailable]: '服务不可用',
    [ApiStatus.gatewayTimeout]: '网关超时'
  }

  return errorMap[status] || '请求失败'
}

/**
 * 处理错误
 * @param error 错误对象
 * @returns 错误对象
 */
export function handleError(error: AxiosError<ErrorResponse>): never {
  // 处理取消的请求
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message)
    throw new HttpError('请求已取消', ApiStatus.error)
  }

  const statusCode = error.response?.status
  // 使用API返回的message字段，如果没有则使用axios的error.message
  const errorMessage = error.response?.data?.message || error.message
  const requestConfig = error.config

  // 记录错误日志但不使用全局错误处理的用户通知（避免重复提示）
  // 这里只记录控制台日志，用户通知由HTTP错误处理统一管理
  console.error('[HTTP Request Error]', {
    message: errorMessage,
    code: error.code,
    url: requestConfig?.url,
    method: requestConfig?.method,
    timestamp: new Date().toISOString()
  })

  // 处理网络错误
  if (!error.response) {
    const httpError = new HttpError('网络错误', ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })

    // 记录网络错误日志（已在上方统一记录，这里不需要重复处理）

    throw httpError
  }

  // 处理 HTTP 状态码错误
  // 优先使用API返回的具体错误消息，如果没有再使用通用错误消息
  const message = errorMessage || (statusCode ? getErrorMessage(statusCode) : '请求失败')
  const httpError = new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  })

  // API错误日志已在上方统一记录，这里不需要重复处理全局错误框架

  throw httpError
}

/**
 * 显示错误消息
 * @param error 错误对象
 * @param showMessage 是否显示错误消息
 */
export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.error(error.message)
  }
  // 记录错误日志
  console.error('[HTTP Error]', error.toLogData())
}

/**
 * 判断是否为 HttpError 类型
 * @param error 错误对象
 * @returns 是否为 HttpError 类型
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}
