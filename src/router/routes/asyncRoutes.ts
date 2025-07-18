import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 1. 前端静态配置 - 直接使用本文件中定义的路由配置
 * 2. 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 */
export const asyncRoutes: AppRouteRecord[] = [
  {
    id: 1,
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: '仪表盘',
      icon: '&#xe721;',
      keepAlive: false,
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        id: 101,
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: '工作台',
          keepAlive: false,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        id: 102,
        path: 'analysis',
        name: 'Analysis',
        component: RoutesAlias.Analysis,
        meta: {
          title: '分析页',
          keepAlive: false,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      }
    ]
  }
]
