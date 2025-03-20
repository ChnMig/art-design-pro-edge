import { RouteLocationNormalized } from 'vue-router'
import { formatMenuTitle } from '@/utils/menu'
import { SystemInfo } from '@/config/setting'

/**
 * 设置页面标题，根据路由元信息和系统信息拼接标题
 * @param to 当前路由对象
 */
export const setPageTitle = (to: RouteLocationNormalized): void => {
  const { title } = to.meta
  if (title) {
    setTimeout(() => {
      document.title = `${formatMenuTitle(String(title))} - ${SystemInfo.name}`
    }, 150)
  }
}
