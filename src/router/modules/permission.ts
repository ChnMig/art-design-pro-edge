import { ref } from 'vue'
import { router } from '@/router'

import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

// 进度条组件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { setPageTitle } from '@/utils/setPageTitle'
import { useUserStore } from '@/store/modules/user'
import { getUserMenu } from '@/api/system/api'
import { ApiStatus } from '@/api/status'
import { MenuListType } from '@/types/menu'
import { processRoute } from '@/utils/menu'
import { ElLoading, ElMessage } from 'element-plus'
import { useMenuStore } from '@/store/modules/menu'
import { useSettingStore } from '@/store/modules/setting'
import { useTheme } from '@/composables/useTheme'
import { setWorktab } from '@/utils/worktab'
import { registerAsyncRoutes } from './dynamicRoutes'
import { fourDotsSpinnerSvg } from '@/assets/svg/loading'

/** 顶部进度条配置 */
NProgress.configure({
  easing: 'ease',
  speed: 600,
  showSpinner: false,
  trickleSpeed: 200,
  parent: 'body'
})

/** 扩展的路由配置类型 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

// 标记是否已经注册动态路由
const isRouteRegistered = ref(false)

/**
 * 路由全局前置守卫
 * 处理进度条、获取菜单列表、动态路由注册、404 检查、工作标签页及页面标题设置
 */
router.beforeEach(async (to, from, next) => {
  const settingStore = useSettingStore()
  if (settingStore.showNprogress) NProgress.start()

  // 设置登录注册页面主题
  setSystemTheme(to)

  // 检查登录状态，如果未登录则跳转到登录页
  const userStore = useUserStore()
  if (!userStore.isLogin && to.path !== '/login' && !to.meta.noLogin) {
    userStore.logOut()
    return next('/login')
  }

  // 如果用户已登录且动态路由未注册，则注册动态路由
  if (!isRouteRegistered.value && userStore.isLogin) {
    try {
      await getMenuData()
      if (to.name === 'Exception404') {
        return next({ path: to.path, query: to.query, replace: true })
      } else {
        return next({ ...to, replace: true })
      }
    } catch (error) {
      console.error('Failed to register routes:', error)
      return next('/exception/500')
    }
  }

  // 检查路由是否存在，若不存在则跳转至404页面
  if (to.matched.length === 0) {
    return next('/exception/404')
  }

  // 设置工作标签页和页面标题
  setWorktab(to)
  setPageTitle(to)

  next()
})

/** 路由全局后置守卫 */
router.afterEach(() => {
  if (useSettingStore().showNprogress) NProgress.done()
})

/**
 * 根据接口返回的菜单列表注册动态路由
 * @throws 若菜单列表为空或获取失败则抛出错误
 */
async function getMenuData(): Promise<void> {
  try {
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
    const menuRes = asyncRoutesData.data
    // 处理后的菜单数据
    const menuList: MenuListType[] = menuRes.map((route: MenuListType) => processRoute(route))
    const loading = ElLoading.service({
      lock: true,
      background: 'rgba(0, 0, 0, 0)',
      svg: fourDotsSpinnerSvg,
      svgViewBox: '0 0 40 40'
    })
    if (!Array.isArray(menuList) || menuList.length === 0) {
      loading.close()
      useUserStore().logOut()
      throw new Error('获取菜单列表失败，请重新登录！')
    }

    // 设置菜单列表
    useMenuStore().setMenuList(menuList as [])
    // 注册异步路由
    registerAsyncRoutes(router, menuList)
    // 标记路由已注册
    isRouteRegistered.value = true
    // 关闭加载动画
    loading.close()
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    throw error
  }
}

/**
 * ------------------------
 * 路由守卫辅助函数
 * ------------------------
 */

/**
 * 根据路由元信息设置系统主题
 * @param to 当前路由对象
 */
const setSystemTheme = (to: RouteLocationNormalized): void => {
  if (to.meta.setTheme) {
    useTheme().switchTheme(useSettingStore().systemThemeType)
  }
}
