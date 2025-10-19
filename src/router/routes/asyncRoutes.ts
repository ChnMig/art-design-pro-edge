import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/**
 * 精简后的异步路由
 * 仅保留：仪表盘、系统管理、异常页面、外链示例
 * 其余示例页面（article/change/examples/result/safeguard/template/widgets）已移除
 */
export const asyncRoutes: AppRouteRecord[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: '仪表盘',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: '工作台',
          keepAlive: false,
          fixedTab: true
        }
      }
    ]
  },

  {
    path: '/system',
    name: 'System',
    component: RoutesAlias.Layout,
    meta: {
      title: '系统管理',
      icon: '&#xe7b9;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: RoutesAlias.User,
        meta: {
          title: '用户管理',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: RoutesAlias.Role,
        meta: {
          title: '角色管理',
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        path: 'tenant',
        name: 'Tenant',
        component: RoutesAlias.Tenant,
        meta: {
          title: '租户管理',
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        path: 'user-center',
        name: 'UserCenter',
        component: RoutesAlias.UserCenter,
        meta: {
          title: '个人中心',
          isHide: true,
          keepAlive: true,
          isHideTab: true
        }
      },
      {
        path: 'menu',
        name: 'Menus',
        component: RoutesAlias.Menu,
        meta: {
          title: '菜单管理',
          keepAlive: true,
          roles: ['R_SUPER'],
          authList: [
            { title: '新增', authMark: 'add' },
            { title: '编辑', authMark: 'edit' },
            { title: '删除', authMark: 'delete' }
          ]
        }
      }
    ]
  },

  {
    path: '/exception',
    name: 'Exception',
    component: RoutesAlias.Layout,
    meta: {
      title: '异常页面',
      icon: '&#xe820;'
    },
    children: [
      {
        path: '403',
        name: '403',
        component: RoutesAlias.Exception403,
        meta: { title: '403', keepAlive: true, isFullPage: true }
      },
      {
        path: '404',
        name: '404',
        component: RoutesAlias.Exception404,
        meta: { title: '404', keepAlive: true, isFullPage: true }
      },
      {
        path: '500',
        name: '500',
        component: RoutesAlias.Exception500,
        meta: { title: '500', keepAlive: true, isFullPage: true }
      }
    ]
  }
]
