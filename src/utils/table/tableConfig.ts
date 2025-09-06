/**
 * useTable 响应体自动识别配置
 * 支持自定义响应体结构的适配器
 */

// 默认响应体结构配置
export interface TableResponseConfig {
  /** 数据字段路径，支持嵌套路径如 'data.list' */
  dataPath?: string
  /** 总数字段路径，支持嵌套路径如 'data.total' */
  totalPath?: string  
  /** 当前页字段路径 */
  currentPath?: string
  /** 每页条数字段路径 */
  sizePath?: string
  /** 成功状态码字段路径 */
  successCodePath?: string
  /** 成功状态码值 */
  successCode?: string | number
}

// 预设的常用响应体结构
export const PRESET_RESPONSE_CONFIGS = {
  // 标准结构：{ data: { records: [], total: 0, current: 1, size: 10 }, code: 200 }
  STANDARD: {
    dataPath: 'data.records',
    totalPath: 'data.total', 
    currentPath: 'data.current',
    sizePath: 'data.size',
    successCodePath: 'code',
    successCode: 200
  },
  
  // 简单结构：{ records: [], total: 0, current: 1, size: 10 }
  SIMPLE: {
    dataPath: 'records',
    totalPath: 'total',
    currentPath: 'current', 
    sizePath: 'size'
  },
  
  // Laravel 分页结构
  LARAVEL: {
    dataPath: 'data',
    totalPath: 'total',
    currentPath: 'current_page',
    sizePath: 'per_page'
  },
  
  // Spring Boot 分页结构
  SPRING_BOOT: {
    dataPath: 'content',
    totalPath: 'totalElements',
    currentPath: 'number',
    sizePath: 'size'
  }
} as const

// 全局默认配置
let globalTableConfig: TableResponseConfig = PRESET_RESPONSE_CONFIGS.STANDARD

/**
 * 设置全局表格响应体配置
 */
export function setGlobalTableConfig(config: TableResponseConfig | keyof typeof PRESET_RESPONSE_CONFIGS) {
  if (typeof config === 'string') {
    globalTableConfig = PRESET_RESPONSE_CONFIGS[config]
  } else {
    globalTableConfig = { ...globalTableConfig, ...config }
  }
}

/**
 * 获取全局表格响应体配置
 */
export function getGlobalTableConfig(): TableResponseConfig {
  return globalTableConfig
}

/**
 * 根据路径获取对象属性值
 */
export function getValueByPath(obj: any, path: string): any {
  if (!path) return obj
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

/**
 * 响应体智能适配器
 * 根据配置自动识别和提取响应体数据
 */
export function createResponseAdapter(config?: TableResponseConfig) {
  const finalConfig = { ...globalTableConfig, ...config }
  
  return function adaptResponse(response: any): {
    records: any[]
    total: number
    current: number
    size: number
  } {
    // 检查响应是否成功
    if (finalConfig.successCodePath && finalConfig.successCode) {
      const responseCode = getValueByPath(response, finalConfig.successCodePath)
      if (responseCode !== finalConfig.successCode) {
        console.warn('[tableConfig] 响应状态码不匹配:', responseCode, '预期:', finalConfig.successCode)
      }
    }
    
    // 提取数据
    const records = getValueByPath(response, finalConfig.dataPath || 'records') || []
    const total = getValueByPath(response, finalConfig.totalPath || 'total') || 0
    const current = getValueByPath(response, finalConfig.currentPath || 'current') || 1
    const size = getValueByPath(response, finalConfig.sizePath || 'size') || 10
    
    // 验证数据类型
    if (!Array.isArray(records)) {
      console.warn('[tableConfig] 数据字段不是数组:', records)
      return { records: [], total: 0, current: 1, size: 10 }
    }
    
    return {
      records,
      total: Number(total) || 0,
      current: Number(current) || 1,
      size: Number(size) || 10
    }
  }
}

/**
 * 自动检测响应体结构
 * 尝试匹配预设的响应体结构
 */
export function detectResponseStructure(response: any): keyof typeof PRESET_RESPONSE_CONFIGS | null {
  for (const [key, config] of Object.entries(PRESET_RESPONSE_CONFIGS)) {
    const records = getValueByPath(response, config.dataPath)
    const total = getValueByPath(response, config.totalPath)
    
    if (Array.isArray(records) && typeof total === 'number') {
      return key as keyof typeof PRESET_RESPONSE_CONFIGS
    }
  }
  
  return null
}

/**
 * 创建针对特定API的响应体适配器
 */
export function createApiAdapter(apiName: string, config: TableResponseConfig) {
  const adapter = createResponseAdapter(config)
  
  return function namedAdapter(response: any) {
    try {
      return adapter(response)
    } catch (error) {
      console.error(`[tableConfig] API ${apiName} 响应体适配失败:`, error)
      return { records: [], total: 0, current: 1, size: 10 }
    }
  }
}