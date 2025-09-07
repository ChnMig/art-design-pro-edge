/**
 * API类型系统优化
 * 提供更强的类型安全和更好的开发体验
 */

/** API响应状态码枚举 */
export enum ApiResponseCode {
  /** 成功 */
  SUCCESS = 0,
  /** 业务错误 */
  BUSINESS_ERROR = 1,
  /** 参数错误 */
  PARAM_ERROR = 400,
  /** 未授权 */
  UNAUTHORIZED = 401,
  /** 禁止访问 */
  FORBIDDEN = 403,
  /** 资源不存在 */
  NOT_FOUND = 404,
  /** 服务器错误 */
  SERVER_ERROR = 500
}

/** API响应接口 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
  /** 时间戳 */
  timestamp?: number
  /** 追踪ID */
  traceId?: string
  /** 是否成功 */
  success?: boolean
}

/** 分页响应接口 */
export interface PaginationResponse<T = any> {
  /** 数据记录 */
  records: T[]
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages?: number
}

/** 分页请求参数 */
export interface PaginationParams {
  /** 当前页码 */
  current?: number
  /** 每页大小 */
  size?: number
}

/** 搜索请求参数基类 */
export interface SearchParams extends PaginationParams {
  /** 排序字段 */
  orderBy?: string
  /** 排序方式 asc|desc */
  order?: 'asc' | 'desc'
}

/** 时间范围查询参数 */
export interface TimeRangeParams {
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
}

/** ID参数 */
export interface IdParams {
  /** ID */
  id: number | string
}

/** 批量ID参数 */
export interface BatchIdParams {
  /** ID列表 */
  ids: (number | string)[]
}

/** 状态参数 */
export interface StatusParams {
  /** 状态 */
  status: number | string
}

/** 排序参数 */
export interface SortParams {
  /** 排序字段 */
  field: string
  /** 排序顺序 */
  order: 'asc' | 'desc'
}

// ============ 认证相关类型 ============

/** 登录请求参数 */
export interface LoginRequest {
  /** 账号 */
  account: string
  /** 密码 */
  password: string
  /** 验证码 */
  captcha: string
  /** 验证码ID */
  captcha_id: string
  /** 记住密码 */
  remember?: boolean
}

/** 登录响应数据 */
export interface LoginResponse {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token: string
  /** 令牌类型 */
  token_type?: string
  /** 过期时间（秒） */
  expires_in?: number
}

/** 验证码响应数据 */
export interface CaptchaResponse {
  /** 验证码ID */
  captcha_id: string
  /** 验证码图片base64 */
  captcha_image: string
}

/** 刷新令牌请求参数 */
export interface RefreshTokenRequest {
  /** 刷新令牌 */
  refresh_token: string
}

// ============ 用户相关类型 ============

/** 用户信息 */
export interface UserInfo {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname?: string
  /** 头像 */
  avatar?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 性别 */
  gender?: number
  /** 状态 */
  status: number
  /** 角色列表 */
  roles: string[]
  /** 权限列表 */
  permissions: string[]
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/** 用户管理 - 用户详情 */
export interface UserDetail {
  /** 登录账号 */
  account: string
  /** 创建时间（时间戳） */
  created_at: number
  /** 部门ID */
  department_id: number
  /** 性别 */
  gender: number
  /** 用户ID */
  id: number
  /** 用户名称 */
  name: string
  /** 密码 */
  password: string
  /** 手机号 */
  phone: string
  /** 角色ID */
  role_id: number
  /** 状态 */
  status: number
  /** 更新时间（时间戳） */
  updated_at: number
  /** 用户名 */
  username: string
}

/** 用户管理 - 用户列表项 */
export interface UserListItem {
  /** 用户基本信息 */
  User: UserDetail
  /** 部门名称 */
  department_name: string
  /** 角色描述 */
  role_desc: string
  /** 角色名称 */
  role_name: string
}

/** 用户管理 - 列表响应 */
export interface UserListResponse {
  /** 状态码 */
  code: number
  /** 状态 */
  status: string
  /** 消息 */
  message: string
  /** 数据列表 */
  data: UserListItem[]
  /** 时间戳 */
  timestamp: number
  /** 总数 */
  total: number
}

/** 用户列表查询参数 */
export interface UserListParams extends SearchParams, TimeRangeParams {
  /** 用户名 */
  username?: string
  /** 昵称 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 状态 */
  status?: number
  /** 角色ID */
  role_id?: number
}

/** 用户创建/更新参数 */
export interface UserFormData {
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 密码（创建时必填） */
  password?: string
  /** 性别 */
  gender?: number
  /** 状态 */
  status: number
  /** 角色ID列表 */
  role_ids: number[]
}

// ============ 菜单相关类型 ============

/** 菜单类型 */
export enum MenuType {
  /** 目录 */
  DIRECTORY = 1,
  /** 菜单 */
  MENU = 2,
  /** 按钮 */
  BUTTON = 3
}

/** 菜单信息 */
export interface MenuInfo {
  /** 菜单ID */
  id: number
  /** 父级ID */
  parent_id: number
  /** 菜单名称 */
  name: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 菜单路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 菜单类型 */
  type: MenuType
  /** 排序 */
  sort: number
  /** 状态 */
  status: number
  /** 是否隐藏 */
  hidden: boolean
  /** 权限标识 */
  permission?: string
  /** 子菜单 */
  children?: MenuInfo[]
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/** 菜单查询参数 */
export interface MenuListParams {
  /** 菜单名称 */
  name?: string
  /** 菜单类型 */
  type?: MenuType
  /** 状态 */
  status?: number
  /** 父级ID */
  parent_id?: number
}

/** 菜单创建/更新参数 */
export interface MenuFormData {
  /** 父级ID */
  parent_id: number
  /** 菜单名称 */
  name: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 菜单路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 菜单类型 */
  type: MenuType
  /** 排序 */
  sort: number
  /** 状态 */
  status: number
  /** 是否隐藏 */
  hidden: boolean
  /** 权限标识 */
  permission?: string
}

// ============ 角色相关类型 ============

/** 角色信息 */
export interface RoleInfo {
  /** 角色ID */
  id: number
  /** 角色名称 */
  name: string
  /** 角色编码 */
  code: string
  /** 角色描述 */
  description?: string
  /** 状态 */
  status: number
  /** 排序 */
  sort: number
  /** 菜单权限 */
  menu_ids: number[]
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/** 角色查询参数 */
export interface RoleListParams extends SearchParams, TimeRangeParams {
  /** 角色名称 */
  name?: string
  /** 角色编码 */
  code?: string
  /** 状态 */
  status?: number
}

/** 角色创建/更新参数 */
export interface RoleFormData {
  /** 角色名称 */
  name: string
  /** 角色编码 */
  code: string
  /** 角色描述 */
  description?: string
  /** 状态 */
  status: number
  /** 排序 */
  sort: number
  /** 菜单权限 */
  menu_ids: number[]
}

// ============ 系统相关类型 ============

/** 系统信息 */
export interface SystemInfo {
  /** 系统名称 */
  name: string
  /** 版本号 */
  version: string
  /** 描述 */
  description?: string
  /** 作者 */
  author?: string
  /** 主页 */
  homepage?: string
  /** 构建时间 */
  build_time: string
  /** Git提交ID */
  git_commit?: string
}

/** 文件上传响应 */
export interface FileUploadResponse {
  /** 文件名 */
  filename: string
  /** 文件路径 */
  url: string
  /** 文件大小 */
  size: number
  /** 文件类型 */
  type: string
}

// ============ 工具类型 ============

/** 提取响应数据类型 */
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : T

/** 提取分页数据类型 */
export type ExtractPaginationData<T> = T extends PaginationResponse<infer U> ? U : T

/** API请求配置 */
export interface ApiRequestConfig {
  /** 是否显示成功消息 */
  showSuccessMessage?: boolean
  /** 是否显示错误消息 */
  showErrorMessage?: boolean
  /** 成功消息文本 */
  successMessage?: string
  /** 是否显示加载中 */
  loading?: boolean
  /** 超时时间 */
  timeout?: number
}

/** CRUD操作类型 */
export enum CrudAction {
  /** 创建 */
  CREATE = 'create',
  /** 读取 */
  READ = 'read',
  /** 更新 */
  UPDATE = 'update',
  /** 删除 */
  DELETE = 'delete'
}

/** 通用操作结果 */
export interface OperationResult {
  /** 是否成功 */
  success: boolean
  /** 消息 */
  message?: string
  /** 错误码 */
  code?: number
  /** 数据 */
  data?: any
}

// ============ 类型工具函数 ============

/** 检查是否为成功响应 */
export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
  return response.code === ApiResponseCode.SUCCESS || response.success === true
}

/** 提取响应数据 */
export function extractResponseData<T>(response: ApiResponse<T>): T {
  return response.data
}

/** 创建分页参数 */
export function createPaginationParams(current = 1, size = 10): PaginationParams {
  return { current, size }
}

/** 创建搜索参数 */
export function createSearchParams(params: Partial<SearchParams> = {}): Required<SearchParams> {
  return {
    current: 1,
    size: 10,
    orderBy: 'id',
    order: 'desc',
    ...params
  }
}

/** 创建时间范围参数 */
export function createTimeRangeParams(startTime?: string, endTime?: string): TimeRangeParams {
  return { startTime, endTime }
}

// ============ 类型守卫 ============

/** 检查是否为分页响应 */
export function isPaginationResponse<T>(data: any): data is PaginationResponse<T> {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.records) &&
    typeof data.current === 'number' &&
    typeof data.size === 'number' &&
    typeof data.total === 'number'
  )
}

/** 检查是否为用户信息 */
export function isUserInfo(data: any): data is UserInfo {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    typeof data.username === 'string' &&
    Array.isArray(data.roles)
  )
}

/** 检查是否为菜单信息 */
export function isMenuInfo(data: any): data is MenuInfo {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    typeof data.type === 'number'
  )
}
