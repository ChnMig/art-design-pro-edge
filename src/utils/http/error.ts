import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { ApiStatus } from './status'
import { 
  handleError as globalHandleError,
  handleNetworkError,
  handleApiError
} from '@/utils/error'

// 错误响应接口
export interface ErrorResponse {
  code: number
  msg: string
  data?: unknown
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
  const errorMessage = error.response?.data?.msg || error.message
  const requestConfig = error.config

  // 使用全局错误处理框架记录和处理错误
  try {
    globalHandleError(error)
  } catch (globalError) {
    // 全局错误处理可能抛出错误，这里忽略继续使用原有逻辑
  }

  // 处理网络错误
  if (!error.response) {
    const httpError = new HttpError('网络错误', ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })
    
    // 使用全局框架记录网络错误
    handleNetworkError(error, requestConfig?.url, {
      details: httpError.toLogData()
    })
    
    throw httpError
  }

  // 处理 HTTP 状态码错误
  const message = statusCode ? getErrorMessage(statusCode) : errorMessage || '请求失败'
  const httpError = new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  })

  // 根据状态码使用相应的全局错误处理
  if (statusCode === 401 || statusCode === 403) {
    // 权限错误
    handleApiError(error, requestConfig?.url, {
      details: httpError.toLogData()
    })
  } else {
    // API错误
    handleApiError(error, requestConfig?.url, {
      details: httpError.toLogData()
    })
  }

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
