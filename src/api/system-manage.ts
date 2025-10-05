import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import { asyncRoutes } from '@/router/routes/asyncRoutes'
import { menuDataToRouter } from '@/router/utils/menuToRouter'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

interface MenuResponse {
  menuList: AppRouteRecord[]
}

// 获取菜单数据（模拟）
// 当前使用本地模拟路由数据，实际项目中请求接口返回 asyncRoutes.ts 文件的数据
export async function fetchGetMenuList(): Promise<MenuResponse> {
  try {
    // 后端控制模式：优先请求后端菜单
    const backendMenu = await request.get<AppRouteRecord[]>({
      url: '/api/v1/admin/system/user/menu',
      showErrorMessage: false
    })

    const menuList = Array.isArray(backendMenu)
      ? backendMenu.map((route) => menuDataToRouter(route))
      : []

    if (menuList.length > 0) {
      return { menuList }
    }
  } catch (error) {
    // 降级到本地 asyncRoutes（前端控制模式或后端异常时）
    console.warn('[menu] 使用本地路由数据，后端菜单获取失败或为空', error)
  }

  // 前端控制模式：使用本地路由
  const localMenu = asyncRoutes.map((route) => menuDataToRouter(route))
  return { menuList: localMenu }
}
