// src/utils/echarts/index.ts
import { echarts, graphic } from '@/utils/echarts'
import type { EChartsOption } from '@/utils/echarts'

// 导出基础 echarts 相关功能
export { echarts }
export type { EChartsOption }
export { graphic }

// 导出工具函数
export * from './useECharts'
export * from './defaultOpstions'

// 默认导出 echarts
export default echarts