/**
 * API操作组合式函数
 * 提供类型安全的API调用和状态管理
 */

import { ref, reactive, computed, type Ref } from 'vue'
import type {
  ApiResponse,
  PaginationResponse,
  PaginationParams,
  SearchParams,
  ApiRequestConfig,
  CrudAction
} from '@/types/api'
import { ApiClient, RestfulClient, type ApiCallOptions } from '@/utils/api/client'
import { ElLoading, type LoadingInstance } from 'element-plus'

/** API操作状态 */
export interface ApiState<T = any> {
  /** 数据 */
  data: T | null
  /** 加载中 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 是否已执行过 */
  executed: boolean
}

/** 分页API状态 */
export interface PaginationApiState<T = any> extends ApiState<PaginationResponse<T>> {
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 总记录数 */
  total: number
  /** 记录列表 */
  records: T[]
}

/** API操作选项 */
export interface UseApiOptions extends ApiRequestConfig {
  /** 是否立即执行 */
  immediate?: boolean
  /** 是否重置状态 */
  resetOnExecute?: boolean
  /** 全屏加载 */
  fullscreenLoading?: boolean
}

/**
 * 通用API操作hook
 */
export function useApi<T = any>(apiCall: () => Promise<T>, options: UseApiOptions = {}) {
  const state = reactive<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    executed: false
  })

  let loadingInstance: LoadingInstance | null = null

  const {
    immediate = false,
    resetOnExecute = true,
    fullscreenLoading = false,
    showSuccessMessage = false,
    successMessage = '操作成功'
  } = options

  /**
   * 执行API调用
   */
  const execute = async (...args: any[]): Promise<T | null> => {
    try {
      if (resetOnExecute) {
        state.error = null
      }

      state.loading = true

      // 全屏加载
      if (fullscreenLoading) {
        loadingInstance = ElLoading.service({
          lock: true,
          text: '加载中...',
          background: 'rgba(0, 0, 0, 0.7)'
        })
      }

      const result = await apiCall(...args)
      state.data = result
      state.executed = true

      if (showSuccessMessage && successMessage) {
        const { ElMessage } = await import('element-plus')
        ElMessage.success(successMessage)
      }

      return result
    } catch (error) {
      state.error = error as Error
      return null
    } finally {
      state.loading = false
      if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    state.data = null
    state.loading = false
    state.error = null
    state.executed = false
  }

  /**
   * 重新执行
   */
  const refresh = () => execute()

  // 立即执行
  if (immediate) {
    execute()
  }

  return {
    ...toRefs(state),
    execute,
    reset,
    refresh,
    // 计算属性
    isSuccess: computed(() => state.executed && !state.error),
    isError: computed(() => !!state.error),
    isEmpty: computed(() => state.executed && !state.data && !state.error)
  }
}

/**
 * 分页API操作hook
 */
export function usePaginationApi<T = any>(
  apiCall: (params: SearchParams) => Promise<PaginationResponse<T>>,
  initialParams: SearchParams = {},
  options: UseApiOptions = {}
) {
  const state = reactive<PaginationApiState<T>>({
    data: null,
    loading: false,
    error: null,
    executed: false,
    current: initialParams.current || 1,
    size: initialParams.size || 10,
    total: 0,
    records: []
  })

  const searchParams = reactive<SearchParams>({
    current: 1,
    size: 10,
    orderBy: 'id',
    order: 'desc',
    ...initialParams
  })

  let loadingInstance: LoadingInstance | null = null

  const { immediate = false, resetOnExecute = true, fullscreenLoading = false } = options

  /**
   * 执行查询
   */
  const execute = async (
    params: Partial<SearchParams> = {}
  ): Promise<PaginationResponse<T> | null> => {
    try {
      if (resetOnExecute) {
        state.error = null
      }

      state.loading = true

      // 全屏加载
      if (fullscreenLoading) {
        loadingInstance = ElLoading.service({
          lock: true,
          text: '加载中...',
          background: 'rgba(0, 0, 0, 0.7)'
        })
      }

      // 合并参数
      const finalParams = {
        ...searchParams,
        ...params
      }

      const result = await apiCall(finalParams)

      state.data = result
      state.current = result.current
      state.size = result.size
      state.total = result.total
      state.records = result.records
      state.executed = true

      // 更新搜索参数
      Object.assign(searchParams, finalParams)

      return result
    } catch (error) {
      state.error = error as Error
      return null
    } finally {
      state.loading = false
      if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
    }
  }

  /**
   * 搜索
   */
  const search = (params: Partial<SearchParams> = {}) => {
    return execute({
      ...params,
      current: 1 // 搜索时重置到第一页
    })
  }

  /**
   * 切换页码
   */
  const changePage = (page: number) => {
    return execute({ current: page })
  }

  /**
   * 切换页面大小
   */
  const changeSize = (size: number) => {
    return execute({ current: 1, size })
  }

  /**
   * 刷新当前页
   */
  const refresh = () => execute()

  /**
   * 重置
   */
  const reset = () => {
    state.data = null
    state.loading = false
    state.error = null
    state.executed = false
    state.current = 1
    state.total = 0
    state.records = []

    // 重置搜索参数
    Object.assign(searchParams, {
      current: 1,
      size: 10,
      orderBy: 'id',
      order: 'desc',
      ...initialParams
    })
  }

  // 立即执行
  if (immediate) {
    execute()
  }

  return {
    ...toRefs(state),
    searchParams: readonly(searchParams),
    execute,
    search,
    changePage,
    changeSize,
    refresh,
    reset,
    // 计算属性
    isSuccess: computed(() => state.executed && !state.error),
    isError: computed(() => !!state.error),
    isEmpty: computed(() => state.executed && state.records.length === 0 && !state.error),
    hasData: computed(() => state.records.length > 0),
    totalPages: computed(() => Math.ceil(state.total / state.size))
  }
}

/**
 * RESTful API操作hook
 */
export function useRestfulApi<T = any>(client: RestfulClient<T>, options: UseApiOptions = {}) {
  const listState = usePaginationApi<T>((params) => client.list(params), {}, options)

  const createState = useApi<T>(() => Promise.resolve(null as any), {
    ...options,
    immediate: false
  })

  const updateState = useApi<T>(() => Promise.resolve(null as any), {
    ...options,
    immediate: false
  })

  const deleteState = useApi<void>(() => Promise.resolve(undefined as any), {
    ...options,
    immediate: false
  })

  /**
   * 创建记录
   */
  const create = async (data: Partial<T>) => {
    createState.execute = () => client.create(data)
    const result = await createState.execute()
    if (result) {
      await listState.refresh()
    }
    return result
  }

  /**
   * 更新记录
   */
  const update = async (id: string | number, data: Partial<T>) => {
    updateState.execute = () => client.update(id, data)
    const result = await updateState.execute()
    if (result) {
      await listState.refresh()
    }
    return result
  }

  /**
   * 删除记录
   */
  const remove = async (id: string | number) => {
    deleteState.execute = () => client.remove(id)
    const result = await deleteState.execute()
    if (result !== null) {
      await listState.refresh()
    }
    return result
  }

  /**
   * 批量删除记录
   */
  const batchRemove = async (ids: (string | number)[]) => {
    deleteState.execute = () => client.batchRemove(ids)
    const result = await deleteState.execute()
    if (result !== null) {
      await listState.refresh()
    }
    return result
  }

  return {
    // 列表状态
    list: listState,
    // 操作状态
    createState: readonly(createState),
    updateState: readonly(updateState),
    deleteState: readonly(deleteState),
    // 操作方法
    create,
    update,
    remove,
    batchRemove,
    // 工具方法
    refresh: listState.refresh,
    reset: () => {
      listState.reset()
      createState.reset()
      updateState.reset()
      deleteState.reset()
    }
  }
}

/**
 * API客户端操作hook
 */
export function useApiClient(client: ApiClient) {
  /**
   * GET请求
   */
  const get = <T = any>(endpoint: string, options?: ApiCallOptions) => {
    return useApi<T>(() => client.get<T>(endpoint, options), {
      immediate: false
    })
  }

  /**
   * POST请求
   */
  const post = <T = any>(endpoint: string, options?: ApiCallOptions) => {
    return useApi<T>(() => client.post<T>(endpoint, options), {
      immediate: false
    })
  }

  /**
   * PUT请求
   */
  const put = <T = any>(endpoint: string, options?: ApiCallOptions) => {
    return useApi<T>(() => client.put<T>(endpoint, options), {
      immediate: false
    })
  }

  /**
   * DELETE请求
   */
  const del = <T = any>(endpoint: string, options?: ApiCallOptions) => {
    return useApi<T>(() => client.delete<T>(endpoint, options), {
      immediate: false
    })
  }

  return {
    get,
    post,
    put,
    delete: del
  }
}

// 导出类型
export type { ApiState, PaginationApiState, UseApiOptions }
