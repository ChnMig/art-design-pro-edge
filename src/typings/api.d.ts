/**
 * namespace: Api
 *
 * 所有接口相关类型定义
 * 在.vue文件使用会报错，需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      tenant_code: string
      account: string
      password: string
      captcha: string
      captcha_id: string
    }

    /** 登录响应（后端返回 data.token、data.expires） */
    interface LoginResponse {
      token: string
      expires?: number
    }

    /** 用户信息 */
    interface UserInfo {
      userId?: number
      userName?: string
      username?: string
      account?: string
      nickName?: string
      email?: string
      avatar?: string
      roles?: string[]
      buttons?: string[]
      tenantCode?: string
      [key: string]: any
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 多租户管理 */
  namespace SystemTenant {
    interface TenantItem {
      id: number
      code: string
      name: string
      description?: string
      status: number
      expires_at?: number | null
      created_at?: number
      [key: string]: unknown
    }

    interface TenantSearchParams {
      page?: number
      page_size?: number
      code?: string
      name?: string
      status?: number
    }

    interface TenantPayload {
      id?: number
      code: string
      name: string
      description?: string
      status: number
      expires_at?: number
    }
  }
}
