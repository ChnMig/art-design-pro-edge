/**
 * namespace: Http & Api
 *
 * 所有接口相关类型定义
 * 在.vue文件使用会报错，需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly', Http: 'readonly' }
 */

/** 全局 HTTP 类型命名空间（与原项目保持一致） */
declare namespace Http {
  /** 基础响应 */
  interface BaseResponse<T = any> {
    // 状态码
    code: number
    // 状态描述
    status?: string
    // 消息（API实际返回字段）
    message?: string
    // 消息（兼容旧格式）
    msg?: string
    // 时间戳
    timestamp?: number
    // 数据
    data?: T
  }
}

declare namespace Api {
  /** 基础类型 */
  namespace Http {
    /** 基础响应 */
    interface BaseResponse<T = any> {
      // 状态码
      code: number
      // 状态描述
      status?: string
      // 消息（API实际返回字段）
      message?: string
      // 消息（兼容旧格式）
      msg?: string
      // 时间戳
      timestamp?: number
      // 数据
      data?: T
    }
  }

  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginatingParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type PaginatingSearchParams = Pick<PaginatingParams, 'current' | 'size'>

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }
  }

  /** 用户类型 */
  namespace User {
    /** 用户信息 */
    interface UserInfo {
      userId: number
      userName: string
      roles: string[]
      buttons: string[]
      avatar?: string
      email?: string
      phone?: string
    }

    /** 用户列表数据 */
    interface UserListData {
      records: UserListItem[]
      current: number
      size: number
      total: number
    }

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
      status: '1' | '2' | '3' | '4' // 1: 在线 2: 离线 3: 异常 4: 注销
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
    }
  }
}
