import { AxiosError } from 'axios'
import { ApiStatus } from './status'

// 错误响应接口
export interface ErrorResponse {
  code: number
  status?: string
  message: string
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

export function handleError(error: AxiosError<ErrorResponse>): never {
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message)
    throw new HttpError('请求已取消', ApiStatus.error)
  }

  const statusCode = error.response?.status
  const errorMessage = error.response?.data?.message || error.message
  const requestConfig = error.config

  console.error('[HTTP Request Error]', {
    message: errorMessage,
    code: error.code,
    url: requestConfig?.url,
    method: requestConfig?.method,
    timestamp: new Date().toISOString()
  })

  if (!error.response) {
    const httpError = new HttpError('网络错误', ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })

    throw httpError
  }

  const message = errorMessage || (statusCode ? getErrorMessage(statusCode) : '请求失败')
  const httpError = new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  })

  throw httpError
}

export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.error(error.message)
  }
  console.error('[HTTP Error]', error.toLogData())
}

export function showSuccess(message: string): void {
  if (!message) return
  ElMessage.success(message)
}

export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}
