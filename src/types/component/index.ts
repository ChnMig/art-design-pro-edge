/**
 * 组件相关类型定义
 */

import { Option } from '../common'

// 搜索组件类型
export type SearchComponentType =
  | 'input'
  | 'number'
  | 'select'
  | 'switch'
  | 'checkbox'
  | 'checkboxgroup'
  | 'radiogroup'
  | 'date'
  | 'daterange'
  | 'datetime'
  | 'datetimerange'
  | 'month'
  | 'monthrange'
  | 'year'
  | 'yearrange'
  | 'week'
  | 'time'
  | 'timerange'
  | 'rate'
  | 'slider'
  | 'cascader'
  | 'timepicker'
  | 'timeselect'
  | 'treeselect'

// 搜索表单项接口
export interface SearchFormItem {
  /** 表单项的唯一标识 */
  key: string
  /** 表单项的标签文本 */
  label: string
  /** 表单项标签的宽度，会覆盖 Form 的 labelWidth */
  labelWidth?: string | number
  /** 表单项类型，可以是预定义的字符串类型或自定义组件 */
  type: SearchComponentType | string | (() => any)
  /** 是否隐藏该表单项 */
  hidden?: boolean
  /** 表单项占据的列宽，基于24格栅格系统 */
  span?: number
  /** 选项数据，用于 select、checkbox-group、radio-group 等 */
  options?: Option[] | (() => Option[]) | Record<string, any>
  /** 传递给表单项组件的属性 */
  props?: Record<string, any>
  /** 表单项的插槽配置 */
  slots?: Record<string, (() => any) | undefined>
  /** 表单项的占位符文本 */
  placeholder?: string
  /** 更多属性配置请参考 ElementPlus 官方文档 */
  [key: string]: any
}

// 表格列配置接口
export interface ColumnOption<T = any> {
  // 列类型
  type?: 'selection' | 'expand' | 'index' | 'globalIndex'
  // 列属性名
  prop?: string
  // 列标题
  label?: string
  // 列宽度
  width?: string | number
  // 最小列宽度
  minWidth?: string | number
  // 固定列
  fixed?: boolean | 'left' | 'right'
  // 是否可排序
  sortable?: boolean
  // 过滤器选项
  filters?: any[]
  // 过滤方法
  filterMethod?: (value: any, row: any) => boolean
  // 过滤器位置
  filterPlacement?: string
  // 是否禁用
  disabled?: boolean
  // 是否选中显示（可用于隐藏列）
  checked?: boolean
  // 自定义渲染函数
  formatter?: (row: T) => any
  // 插槽相关配置
  // 是否使用插槽渲染内容
  useSlot?: boolean
  // 插槽名称（默认为 prop 值）
  slotName?: string
  // 是否使用表头插槽
  useHeaderSlot?: boolean
  // 表头插槽名称（默认为 `${prop}-header`）
  headerSlotName?: string
  // 其他属性
  [key: string]: any
}

// 分页配置
export interface PaginationConfig {
  // 当前页
  currentPage: number
  // 每页条数
  pageSize: number
  // 总条数
  total: number
  // 每页显示个数选择器的选项
  pageSizes?: number[]
  // 组件布局
  layout?: string
  // 是否为小型分页
  small?: boolean
}

// 表单规则
export interface FormRule {
  // 是否必填
  required?: boolean
  // 错误提示信息
  message?: string
  // 触发方式
  trigger?: string | string[]
  // 最小长度
  min?: number
  // 最大长度
  max?: number
  // 正则表达式
  pattern?: RegExp
  // 自定义验证函数
  validator?: (rule: any, value: any, callback: any) => void
}

// 对话框配置
export interface DialogConfig {
  // 标题
  title: string
  // 是否显示
  visible: boolean
  // 宽度
  width?: string | number
  // 是否可以通过点击 modal 关闭
  closeOnClickModal?: boolean
  // 是否可以通过按下 ESC 关闭
  closeOnPressEscape?: boolean
  // 是否显示关闭按钮
  showClose?: boolean
  // 是否在 Dialog 出现时将 body 滚动锁定
  lockScroll?: boolean
  // 是否显示遮罩层
  modal?: boolean
  // 自定义类名
  customClass?: string
}
