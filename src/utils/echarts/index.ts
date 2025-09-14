// src/utils/echarts/index.ts
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

// 导出基础 echarts 相关功能
export { echarts }
export type { EChartsOption }
export { graphic } from 'echarts'

// 导出工具函数
export * from './useECharts'
export * from './defaultOpstions'

// 默认导出 echarts
export default echarts