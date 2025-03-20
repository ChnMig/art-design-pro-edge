import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { staticRoutes } from './modules/staticRoutes'

/** 创建路由实例 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

/**
 * 初始化路由，将 Vue Router 实例挂载到 Vue 应用中
 * @param app Vue 应用实例
 */
export function initRouter(app: App<Element>): void {
  app.use(router)
}
