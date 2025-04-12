import { RouteRecordRaw } from 'vue-router'
import Home from '@views/layout/index.vue'
import { RoutesAlias } from './routesAlias'
import { HOME_PAGE } from './routesAlias'

/** 扩展的路由配置类型 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

/** 静态路由配置 */
export const staticRoutes: AppRouteRecordRaw[] = [
  { path: '/', redirect: HOME_PAGE },
  {
    path: RoutesAlias.Login,
    name: 'Login',
    component: () => import('@views/login/index.vue'),
    meta: { title: '登录', isHideTab: true, setTheme: true }
  },
  {
    path: RoutesAlias.ForgetPassword,
    name: 'ForgetPassword',
    component: () => import('@views/forget-password/index.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true, noLogin: true, setTheme: true }
  },
  {
    path: '/exception',
    component: Home,
    name: 'Exception',
    meta: { title: '异常页面' },
    children: [
      {
        path: RoutesAlias.Exception403,
        name: 'Exception403',
        component: () => import('@/views/exception/403.vue'),
        meta: { title: '403' }
      },
      {
        path: RoutesAlias.Exception404,
        name: 'Exception404',
        component: () => import('@views/exception/404.vue'),
        meta: { title: '404' }
      },
      {
        path: RoutesAlias.Exception500,
        name: 'Exception500',
        component: () => import('@views/exception/500.vue'),
        meta: { title: '500' }
      },
      {
        path: '/:catchAll(.*)',
        name: 'Exception404',
        component: () => import('@views/exception/404.vue'),
        meta: { title: '404' }
      }
    ]
  }
]
