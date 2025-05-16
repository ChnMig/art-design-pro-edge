import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { setWorktab } from '@/utils/worktab'
import { setPageTitle, setSystemTheme } from '../utils/utils'
import { getUserMenu } from '@/api/system/api'
import { ApiStatus } from '@/api/status'
import { registerDynamicRoutes } from '../utils/registerRoutes'
import { MenuListType } from '@/types/menu'
import { RoutesAlias } from '../routesAlias'
import { menuDataToRouter } from '@/router/utils/menuToRouter' // 导入 menuDataToRouter 方法，用于菜单数据转换

// 是否已注册动态路由
export const isRouteRegistered = ref(false)

/**
 * 路由全局前置守卫
 * 处理进度条、获取菜单列表、动态路由注册、404 检查、工作标签页及页面标题设置
 */
export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        await handleRouteGuard(to, from, next, router)
      } catch (error) {
        console.error('路由守卫处理失败:', error)
        next('/exception/500')
      }
    }
  )
}

/**
 * 处理路由守卫逻辑
 */
async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  // 处理进度条
  if (settingStore.showNprogress) {
    NProgress.start()
  }

  // 设置系统主题
  setSystemTheme(to)

  // 处理登录状态
  if (!(await handleLoginStatus(to, userStore, next))) {
    return
  }

  // 处理动态路由注册
  if (!isRouteRegistered.value && userStore.isLogin) {
    await handleDynamicRoutes(to, router, next)
    return
  }

  // 处理已知的匹配路由
  if (to.matched.length > 0) {
    // 设置页面信息
    setWorktab(to)
    setPageTitle(to)
    next()
    return
  }

  // 尝试刷新路由重新注册
  if (userStore.isLogin) {
    isRouteRegistered.value = false
    await handleDynamicRoutes(to, router, next)
    return
  }

  // 如果以上都不匹配，跳转到404
  next(RoutesAlias.Exception404)
}

/**
 * 处理登录状态
 */
async function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
  next: NavigationGuardNext
): Promise<boolean> {
  if (!userStore.isLogin && to.path !== '/login' && !to.meta.noLogin) {
    userStore.logOut()
    next('/login')
    return false
  }
  return true
}

/**
 * 处理动态路由注册
 */
async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  router: Router,
  next: NavigationGuardNext
): Promise<void> {
  try {
    await getMenuData(router)
    // 重新导航到目标路由，以便重新匹配
    next({ path: to.fullPath, replace: true })
  } catch (error) {
    console.error('动态路由注册失败:', error)
    next('/exception/500')
  }
}

/**
 * 获取菜单数据并注册动态路由
 */
async function getMenuData(router: Router): Promise<void> {
  // 获取菜单列表
  console.log('获取用户菜单...')
  const asyncRoutesData = await getUserMenu()
  if (asyncRoutesData.code === ApiStatus.success) {
    console.log('获取用户菜单成功:', asyncRoutesData.data)
  } else {
    ElMessage.error(asyncRoutesData.message)
    console.error('获取用户菜单失败:', asyncRoutesData.message)
    asyncRoutesData.data = []
  }
  // 获取到的菜单数据
  const menuRes = Array.isArray(asyncRoutesData.data) ? asyncRoutesData.data : []

  const menuList: MenuListType[] = menuRes.map((route: MenuListType) => menuDataToRouter(route))

  if (!isValidMenuList(menuList)) {
    useUserStore().logOut()
    throw new Error('获取菜单列表失败，请重新登录！')
  }

  const menuStore = useMenuStore()
  menuStore.setMenuList(menuList)

  registerDynamicRoutes(router, menuList)
  isRouteRegistered.value = true
}

/**
 * 验证菜单列表是否有效
 */
function isValidMenuList(menuList: MenuListType[]) {
  return Array.isArray(menuList) && menuList.length > 0
}
