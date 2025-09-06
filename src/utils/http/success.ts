/**
 * HTTP成功消息处理
 * 为API请求提供成功消息配置和管理
 */

import type { AxiosRequestConfig } from 'axios'

/** 成功消息配置接口 */
export interface SuccessMessageConfig {
  /** 是否显示成功消息 */
  show: boolean
  /** 成功消息文本 */
  message?: string
  /** 消息显示时长（毫秒） */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
}

/** 默认成功消息配置 */
const DEFAULT_SUCCESS_CONFIG: Required<SuccessMessageConfig> = {
  show: false,
  message: '操作成功',
  duration: 3000,
  closable: true
}

/** 操作类型与默认消息映射 */
const OPERATION_MESSAGES: Record<string, string> = {
  create: '创建成功',
  add: '添加成功',
  save: '保存成功',
  update: '更新成功',
  edit: '编辑成功',
  modify: '修改成功',
  delete: '删除成功',
  remove: '移除成功',
  upload: '上传成功',
  download: '下载成功',
  import: '导入成功',
  export: '导出成功',
  copy: '复制成功',
  move: '移动成功',
  enable: '启用成功',
  disable: '禁用成功',
  activate: '激活成功',
  deactivate: '停用成功',
  publish: '发布成功',
  unpublish: '取消发布成功',
  approve: '审核通过',
  reject: '审核拒绝',
  submit: '提交成功',
  cancel: '取消成功',
  reset: '重置成功',
  refresh: '刷新成功',
  sync: '同步成功'
}

/**
 * 根据操作类型获取默认成功消息
 */
export function getOperationMessage(operation: string): string {
  const lowerOperation = operation.toLowerCase()

  // 直接匹配
  if (OPERATION_MESSAGES[lowerOperation]) {
    return OPERATION_MESSAGES[lowerOperation]
  }

  // 模糊匹配
  const matchedKey = Object.keys(OPERATION_MESSAGES).find(
    (key) => lowerOperation.includes(key) || key.includes(lowerOperation)
  )

  if (matchedKey) {
    return OPERATION_MESSAGES[matchedKey]
  }

  return DEFAULT_SUCCESS_CONFIG.message
}

/**
 * 创建带成功消息的请求配置
 */
export function withSuccessMessage(
  config: AxiosRequestConfig,
  successConfig: string | boolean | Partial<SuccessMessageConfig> = true
): AxiosRequestConfig {
  let successMessage: SuccessMessageConfig

  if (typeof successConfig === 'boolean') {
    successMessage = {
      ...DEFAULT_SUCCESS_CONFIG,
      show: successConfig
    }
  } else if (typeof successConfig === 'string') {
    successMessage = {
      ...DEFAULT_SUCCESS_CONFIG,
      show: true,
      message: successConfig
    }
  } else {
    successMessage = {
      ...DEFAULT_SUCCESS_CONFIG,
      ...successConfig
    }
  }

  return {
    ...config,
    showSuccessMessage: successMessage.show,
    successMessage: successMessage.message
  }
}

/**
 * 为创建操作添加成功消息
 */
export function withCreateSuccess(
  config: AxiosRequestConfig,
  message?: string
): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES.create)
}

/**
 * 为更新操作添加成功消息
 */
export function withUpdateSuccess(
  config: AxiosRequestConfig,
  message?: string
): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES.update)
}

/**
 * 为删除操作添加成功消息
 */
export function withDeleteSuccess(
  config: AxiosRequestConfig,
  message?: string
): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES.delete)
}

/**
 * 为保存操作添加成功消息
 */
export function withSaveSuccess(config: AxiosRequestConfig, message?: string): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES.save)
}

/**
 * 为上传操作添加成功消息
 */
export function withUploadSuccess(
  config: AxiosRequestConfig,
  message?: string
): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES.upload)
}

/**
 * 为下载操作添加成功消息
 */
export function withDownloadSuccess(
  config: AxiosRequestConfig,
  message?: string
): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES.download)
}

/**
 * 批量操作成功消息
 */
export function withBatchSuccess(
  config: AxiosRequestConfig,
  operation: string,
  count?: number,
  message?: string
): AxiosRequestConfig {
  const baseMessage = OPERATION_MESSAGES[operation.toLowerCase()] || '批量操作成功'
  const finalMessage =
    message ||
    (count ? `批量${baseMessage.replace('成功', '')}${count}项成功` : `批量${baseMessage}`)

  return withSuccessMessage(config, finalMessage)
}

/**
 * 状态切换操作成功消息
 */
export function withStatusChangeSuccess(
  config: AxiosRequestConfig,
  status: 'enable' | 'disable' | 'activate' | 'deactivate',
  message?: string
): AxiosRequestConfig {
  return withSuccessMessage(config, message || OPERATION_MESSAGES[status])
}

/**
 * 自动检测操作类型并添加成功消息
 */
export function withAutoSuccess(
  config: AxiosRequestConfig,
  customMessage?: string
): AxiosRequestConfig {
  if (customMessage) {
    return withSuccessMessage(config, customMessage)
  }

  const method = config.method?.toLowerCase() || 'get'
  const url = config.url || ''

  // 根据HTTP方法和URL路径推断操作类型
  let operation = 'success'

  if (method === 'post') {
    if (url.includes('/upload')) operation = 'upload'
    else if (url.includes('/import')) operation = 'import'
    else if (url.includes('/copy')) operation = 'copy'
    else if (url.includes('/batch')) operation = 'create'
    else operation = 'create'
  } else if (method === 'put' || method === 'patch') {
    if (url.includes('/enable')) operation = 'enable'
    else if (url.includes('/disable')) operation = 'disable'
    else if (url.includes('/activate')) operation = 'activate'
    else if (url.includes('/deactivate')) operation = 'deactivate'
    else operation = 'update'
  } else if (method === 'delete') {
    if (url.includes('/batch')) operation = 'delete'
    else operation = 'delete'
  } else if (method === 'get') {
    if (url.includes('/download')) operation = 'download'
    else if (url.includes('/export')) operation = 'export'
    else return config // GET请求默认不显示成功消息
  }

  const message = OPERATION_MESSAGES[operation] || DEFAULT_SUCCESS_CONFIG.message

  return withSuccessMessage(config, message)
}

/**
 * 禁用成功消息
 */
export function withoutSuccessMessage(config: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    showSuccessMessage: false
  }
}

// ============ 导出常用配置 ============

/** 常用成功消息配置 */
export const SuccessConfigs = {
  /** 创建操作 */
  CREATE: { show: true, message: OPERATION_MESSAGES.create },
  /** 更新操作 */
  UPDATE: { show: true, message: OPERATION_MESSAGES.update },
  /** 删除操作 */
  DELETE: { show: true, message: OPERATION_MESSAGES.delete },
  /** 保存操作 */
  SAVE: { show: true, message: OPERATION_MESSAGES.save },
  /** 上传操作 */
  UPLOAD: { show: true, message: OPERATION_MESSAGES.upload },
  /** 下载操作 */
  DOWNLOAD: { show: true, message: OPERATION_MESSAGES.download },
  /** 启用操作 */
  ENABLE: { show: true, message: OPERATION_MESSAGES.enable },
  /** 禁用操作 */
  DISABLE: { show: true, message: OPERATION_MESSAGES.disable },
  /** 不显示消息 */
  NONE: { show: false }
} as const

/** 导出操作消息映射，供外部使用 */
export { OPERATION_MESSAGES as OperationMessages }
