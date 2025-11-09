import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { ref, nextTick } from 'vue'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { useWorktabStore } from '@/store/modules/worktab'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle } from '@/utils/router'
import { fetchGetMenuList } from '@/api/system-manage'
import { registerDynamicRoutes } from '../utils/registerRoutes'
import type { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'
import { menuDataToRouter } from '../utils/menuToRouter'
import { asyncRoutes } from '../routes/asyncRoutes'
import { staticRoutes } from '../routes/staticRoutes'
import { loadingService } from '@/utils/ui'
import { useCommon } from '@/composables/useCommon'
import { useAppMode } from '@/hooks/core/useAppMode'
import { fetchGetUserInfo } from '@/api/auth'
import { ApiStatus } from '@/utils/http/status'
import { HttpError, isHttpError } from '@/utils/http/error'

// 是否已注册动态路由
const isRouteRegistered = ref(false)
// 跟踪是否需要关闭 loading
const pendingLoading = ref(false)

export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    try {
      await handleRouteGuard(to, from, next, router)
    } catch (error) {
      console.error('路由守卫处理失败:', error)
      next({ name: 'Exception500' })
    }
  })

  router.afterEach(() => {
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) NProgress.done()
    if (pendingLoading.value) {
      nextTick(() => {
        loadingService.hideLoading()
        pendingLoading.value = false
      })
    }
  })
}

// 处理路由守卫主流程
async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  if (settingStore.showNprogress) NProgress.start()

  if (!(await handleLoginStatus(to, userStore, next))) return

  if (!isRouteRegistered.value && userStore.isLogin) {
    await handleDynamicRoutes(to, from, next, router)
    return
  }

  if (userStore.isLogin && isRouteRegistered.value && handleRootPathRedirect(to, next)) return

  if (to.matched.length > 0) {
    setWorktab(to)
    setPageTitle(to)
    next()
    return
  }

  next({ name: 'Exception404' })
}

// 未登录访问受保护页面，跳转登录
async function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
  next: NavigationGuardNext
): Promise<boolean> {
  const isStaticRoute = isRouteInStaticRoutes(to.path)
  if (!userStore.isLogin && to.path !== RoutesAlias.Login && !isStaticRoute) {
    userStore.logOut()
    next({ name: 'Login' })
    return false
  }
  return true
}

// 检查是否为静态路由（基于 path 支持通配与动态参数）
function isRouteInStaticRoutes(path: string): boolean {
  const checkRoute = (routes: any[], targetPath: string): boolean => {
    return routes.some((route) => {
      const routePath = route.path as string
      const pattern = routePath.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(targetPath)) return true
      if (route.children && route.children.length > 0) return checkRoute(route.children, targetPath)
      return false
    })
  }
  return checkRoute(staticRoutes, path)
}

// 处理动态路由注册
async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  pendingLoading.value = true
  loadingService.showLoading()
  try {
    await fetchUserInfoIfNeeded(from)
    await getMenuData(router)
    if (handleRootPathRedirect(to, next)) return
    // 使用路径重匹配，避免携带 404 的 matched 导致持续落入 404
    next({ path: to.path, query: to.query, hash: to.hash, replace: true })
  } catch (error) {
    console.error('动态路由注册失败:', error)
    if (isUnauthorizedError(error)) {
      next(false)
      return
    }
    isRouteRegistered.value = true
    next({ name: 'Exception500' })
  }
}

// 拉取菜单并注册
async function getMenuData(router: Router): Promise<void> {
  const { isFrontendMode } = useAppMode()
  if (isFrontendMode.value) {
    await processFrontendMenu(router)
  } else {
    await processBackendMenu(router)
  }
}

// 前端控制模式：本地路由 + 角色过滤
async function processFrontendMenu(router: Router): Promise<void> {
  const menuList = asyncRoutes.map((route) => menuDataToRouter(route))
  const userStore = useUserStore()
  const roles = (userStore.info as any).roles
  if (!roles) throw new Error('获取用户角色失败')
  const filteredMenuList = filterMenuByRoles(menuList, roles)
  await registerAndStoreMenu(router, filteredMenuList)
}

// 后端控制模式：按后端返回注册（适配本仓库 API 返回 shape）
async function processBackendMenu(router: Router): Promise<void> {
  const { menuList } = await fetchGetMenuList()
  await registerAndStoreMenu(router, menuList)
}

// 过滤空目录/无效项
function filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
  return menuList
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterEmptyMenus(item.children)
        return { ...item, children: filteredChildren }
      }
      return item
    })
    .filter((item) => {
      if ('children' in item) return true
      if ((item as any).meta?.isIframe === true || (item as any).meta?.link) return true
      if (
        (item as any).component &&
        (item as any).component !== '' &&
        item.component !== RoutesAlias.Layout
      )
        return true
      return false
    })
}

// 注册路由并存储菜单
async function registerAndStoreMenu(router: Router, menuList: AppRouteRecord[]): Promise<void> {
  if (!isValidMenuList(menuList)) throw new Error('获取菜单列表失败，请重新登录')
  const menuStore = useMenuStore()
  const list = filterEmptyMenus(menuList)
  menuStore.setMenuList(list)
  registerDynamicRoutes(router, list)
  isRouteRegistered.value = true
  useWorktabStore().validateWorktabs(router)
}

// 角色过滤（仅前端模式用）
const filterMenuByRoles = (menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] => {
  return menu.reduce((acc: AppRouteRecord[], item) => {
    const itemRoles = (item as any).meta?.roles
    const hasPermission = !itemRoles || itemRoles.some((role: string) => roles?.includes(role))
    if (hasPermission) {
      const filteredItem: AppRouteRecord = { ...item }
      if (filteredItem.children?.length) {
        filteredItem.children = filterMenuByRoles(filteredItem.children, roles)
      }
      acc.push(filteredItem)
    }
    return acc
  }, [])
}

function isValidMenuList(menuList: AppRouteRecord[]): boolean {
  return Array.isArray(menuList) && menuList.length > 0
}

// 重置路由相关状态
export function resetRouterState(): void {
  isRouteRegistered.value = false
  const menuStore = useMenuStore()
  menuStore.removeAllDynamicRoutes()
  menuStore.setMenuList([])
}

// 根路径跳转首页
function handleRootPathRedirect(to: RouteLocationNormalized, next: NavigationGuardNext): boolean {
  if (to.path === '/') {
    const { homePath } = useCommon()
    if (homePath.value && homePath.value !== '/') {
      next({ path: homePath.value, replace: true })
      return true
    }
  }
  return false
}

// 若需要则获取用户信息
async function fetchUserInfoIfNeeded(from: RouteLocationNormalized): Promise<void> {
  const userStore = useUserStore()
  const isRefresh = from.path === '/'
  const needFetch = isRefresh || !userStore.info || Object.keys(userStore.info).length === 0
  if (needFetch) {
    const data = await fetchGetUserInfo()
    userStore.setUserInfo(data as any)
  }
}

function isUnauthorizedError(error: unknown): error is HttpError {
  return isHttpError(error) && (error as HttpError).code === ApiStatus.unauthorized
}
