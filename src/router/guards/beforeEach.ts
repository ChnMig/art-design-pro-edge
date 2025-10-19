import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle } from '../utils/utils'
import { RoutesAlias } from '../routesAlias'
import { fetchGetMenuList } from '@/api/system-manage'
import { registerDynamicRoutes } from '../utils/registerRoutes'
import { useCommon } from '@/composables/useCommon'

let isRouteRegistered = false

export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const settingStore = useSettingStore()
    const userStore = useUserStore()

    if (settingStore.showNprogress) NProgress.start()

    // 未登录且需要登录的页面，跳转登录
    if (!userStore.isLogin && to.path !== RoutesAlias.Login && !to.meta.noLogin) {
      userStore.logOut()
      next(RoutesAlias.Login)
      return
    }

    // 首次注册动态路由（登录后）
    if (userStore.isLogin && !isRouteRegistered) {
      try {
        const { menuList } = await fetchGetMenuList()
        registerDynamicRoutes(router, menuList)
        isRouteRegistered = true
        next({ ...to, replace: true })
        return
      } catch (error) {
        console.error('动态路由注册失败:', error)
        next('/exception/500')
        return
      }
    }

    // 首页重定向（仅登录后首次）
    if (userStore.isLogin && isRouteRegistered && to.path === '/') {
      const homePath = useCommon().homePath.value || '/dashboard/console'
      next(homePath)
      return
    }

    // 正常进入页面
    if (to.matched.length > 0) {
      setWorktab(to)
      setPageTitle(to)
      next()
    } else {
      next(RoutesAlias.Exception404)
    }
  })

  router.afterEach(() => {
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) NProgress.done()
  })
}

/**
 * 重置路由注册状态（用于退出登录等场景）
 */
export function resetRouterState(): void {
  isRouteRegistered = false
}
