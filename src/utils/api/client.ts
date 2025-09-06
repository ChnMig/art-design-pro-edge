/**
 * 通用API客户端
 * 提供类型安全的API调用方法
 */

import type {
  PaginationResponse,
  PaginationParams,
  SearchParams,
  ApiRequestConfig
} from '@/types/api'
import { CrudAction } from '@/types/api'
import { api } from '@/utils/http'
import { withCreateSuccess, withUpdateSuccess, withDeleteSuccess } from '@/utils/http/success'
import { ElMessage } from 'element-plus'

/** API客户端配置 */
export interface ApiClientConfig extends ApiRequestConfig {
  /** 基础URL路径 */
  baseUrl: string
  /** 默认配置 */
  defaults?: Partial<ApiRequestConfig>
}

/** API调用选项 */
export interface ApiCallOptions extends ApiRequestConfig {
  /** 请求参数 */
  params?: Record<string, any>
  /** 请求数据 */
  data?: Record<string, any>
  /** URL参数 */
  urlParams?: Record<string, string | number>
}

/**
 * 通用API客户端类
 */
export class ApiClient {
  private baseUrl: string
  private defaults: Partial<ApiRequestConfig>

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl
    this.defaults = {
      showSuccessMessage: false,
      showErrorMessage: true,
      loading: false,
      timeout: 15000,
      ...config.defaults
    }
  }

  /**
   * 构建URL
   */
  private buildUrl(endpoint: string, urlParams?: Record<string, string | number>): string {
    let url = `${this.baseUrl}${endpoint}`

    if (urlParams) {
      Object.entries(urlParams).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value))
      })
    }

    return url
  }

  /**
   * 合并配置
   */
  private mergeOptions(options: ApiCallOptions = {}): Required<ApiRequestConfig> {
    return {
      showSuccessMessage: false,
      showErrorMessage: true,
      loading: false,
      timeout: 15000,
      successMessage: '',
      ...this.defaults,
      ...options
    }
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(
    requestPromise: Promise<T>,
    options: Required<ApiRequestConfig>
  ): Promise<T> {
    const response = await requestPromise

    // 显示成功消息
    if (options.showSuccessMessage && options.successMessage) {
      ElMessage.success(options.successMessage)
    }

    return response
  }

  /**
   * GET请求
   */
  async get<T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
    const config = this.mergeOptions(options)
    const url = this.buildUrl(endpoint, options.urlParams)

    const requestPromise = api.get<T>({
      url,
      params: options.params,
      timeout: config.timeout,
      showErrorMessage: config.showErrorMessage
    })

    return this.handleResponse(requestPromise, config)
  }

  /**
   * POST请求
   */
  async post<T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
    const config = this.mergeOptions(options)
    const url = this.buildUrl(endpoint, options.urlParams)

    const requestPromise = api.post<T>({
      url,
      data: options.data,
      params: options.params,
      timeout: config.timeout,
      showErrorMessage: config.showErrorMessage
    })

    return this.handleResponse(requestPromise, config)
  }

  /**
   * PUT请求
   */
  async put<T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
    const config = this.mergeOptions(options)
    const url = this.buildUrl(endpoint, options.urlParams)

    const requestPromise = api.put<T>({
      url,
      data: options.data,
      params: options.params,
      timeout: config.timeout,
      showErrorMessage: config.showErrorMessage
    })

    return this.handleResponse(requestPromise, config)
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
    const config = this.mergeOptions(options)
    const url = this.buildUrl(endpoint, options.urlParams)

    const requestPromise = api.del<T>({
      url,
      params: options.params,
      timeout: config.timeout,
      showErrorMessage: config.showErrorMessage
    })

    return this.handleResponse(requestPromise, config)
  }

  /**
   * 分页查询
   */
  async paginate<T = any>(
    endpoint: string,
    paginationParams: PaginationParams = {},
    searchParams: Record<string, any> = {},
    options: Omit<ApiCallOptions, 'params'> = {}
  ): Promise<PaginationResponse<T>> {
    return this.get<PaginationResponse<T>>(endpoint, {
      ...options,
      params: {
        current: 1,
        size: 10,
        ...paginationParams,
        ...searchParams
      }
    })
  }

  /**
   * 通用CRUD操作
   */
  async crud<T = any>(
    action: CrudAction,
    endpoint: string,
    options: ApiCallOptions = {}
  ): Promise<T> {
    let requestConfig: any = {
      url: this.buildUrl(endpoint, options.urlParams),
      data: options.data,
      params: options.params,
      timeout: this.mergeOptions(options).timeout,
      showErrorMessage: this.mergeOptions(options).showErrorMessage
    }

    switch (action) {
      case CrudAction.CREATE:
        requestConfig = withCreateSuccess(requestConfig, options.successMessage)
        return api.post<T>(requestConfig)

      case CrudAction.READ:
        return api.get<T>(requestConfig)

      case CrudAction.UPDATE:
        requestConfig = withUpdateSuccess(requestConfig, options.successMessage)
        return api.put<T>(requestConfig)

      case CrudAction.DELETE:
        requestConfig = withDeleteSuccess(requestConfig, options.successMessage)
        return api.del<T>(requestConfig)

      default:
        throw new Error(`不支持的CRUD操作: ${action}`)
    }
  }
}

/**
 * 创建API客户端实例
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}

/**
 * RESTful资源客户端
 * 为RESTful资源提供标准化的CRUD操作
 */
export class RestfulClient<T = any> {
  private resourceName: string
  private client: ApiClient

  constructor(resourceName: string, config?: Partial<ApiClientConfig>) {
    this.resourceName = resourceName
    this.client = new ApiClient({
      baseUrl: config?.baseUrl || '',
      ...config
    })
  }

  /**
   * 获取资源列表
   */
  async list(
    params: SearchParams = {},
    options: Omit<ApiCallOptions, 'params'> = {}
  ): Promise<PaginationResponse<T>> {
    return this.client.paginate<T>(
      `/${this.resourceName}`,
      { current: params.current, size: params.size },
      { orderBy: params.orderBy, order: params.order },
      options
    )
  }

  /**
   * 获取单个资源
   */
  async get(id: string | number, options: ApiCallOptions = {}): Promise<T> {
    return this.client.get<T>(`/${this.resourceName}/:id`, {
      ...options,
      urlParams: { id }
    })
  }

  /**
   * 创建资源
   */
  async create(data: Partial<T>, options: Omit<ApiCallOptions, 'data'> = {}): Promise<T> {
    return this.client.crud<T>(CrudAction.CREATE, `/${this.resourceName}`, {
      ...options,
      data,
      successMessage: options.successMessage || `${this.resourceName}创建成功`
    })
  }

  /**
   * 更新资源
   */
  async update(
    id: string | number,
    data: Partial<T>,
    options: Omit<ApiCallOptions, 'data'> = {}
  ): Promise<T> {
    return this.client.crud<T>(CrudAction.UPDATE, `/${this.resourceName}/:id`, {
      ...options,
      data,
      urlParams: { id },
      successMessage: options.successMessage || `${this.resourceName}更新成功`
    })
  }

  /**
   * 删除资源
   */
  async remove(id: string | number, options: ApiCallOptions = {}): Promise<void> {
    return this.client.crud<void>(CrudAction.DELETE, `/${this.resourceName}/:id`, {
      ...options,
      urlParams: { id },
      successMessage: options.successMessage || `${this.resourceName}删除成功`
    })
  }

  /**
   * 批量删除资源
   */
  async batchRemove(
    ids: (string | number)[],
    options: Omit<ApiCallOptions, 'data'> = {}
  ): Promise<void> {
    return this.client.crud<void>(CrudAction.DELETE, `/${this.resourceName}/batch`, {
      ...options,
      data: { ids },
      successMessage: options.successMessage || `${this.resourceName}批量删除成功`
    })
  }
}

/**
 * 创建RESTful客户端
 */
export function createRestfulClient<T = any>(
  resourceName: string,
  config?: Partial<ApiClientConfig>
): RestfulClient<T> {
  return new RestfulClient<T>(resourceName, config)
}

// ============ 预定义客户端 ============

/** 系统API客户端 */
export const systemApiClient = createApiClient({
  baseUrl: '/system',
  defaults: {
    showErrorMessage: true,
    timeout: 15000
  }
})

/** 用户API客户端 */
export const userApiClient = createRestfulClient('user', {
  baseUrl: '/system',
  defaults: {
    showSuccessMessage: true
  }
})

/** 角色API客户端 */
export const roleApiClient = createRestfulClient('role', {
  baseUrl: '/system',
  defaults: {
    showSuccessMessage: true
  }
})

/** 菜单API客户端 */
export const menuApiClient = createRestfulClient('menu', {
  baseUrl: '/system',
  defaults: {
    showSuccessMessage: true
  }
})
