import type { Router } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'
import { RouteRegistry, IframeRouteManager } from '../core'

const registryMap = new WeakMap<Router, RouteRegistry>()

function getRegistry(router: Router): RouteRegistry {
  let registry = registryMap.get(router)
  if (!registry) {
    registry = new RouteRegistry(router)
    registryMap.set(router, registry)
  }
  return registry
}

export function registerDynamicRoutes(router: Router, menuList: AppRouteRecord[]): void {
  const registry = getRegistry(router)
  registry.register(menuList)
  processIframeRoutes(menuList)
}

export function unregisterDynamicRoutes(router: Router): void {
  const registry = registryMap.get(router)
  if (registry) {
    registry.unregister()
  }
  IframeRouteManager.getInstance().clear()
}

function processIframeRoutes(menuList: AppRouteRecord[]): void {
  const iframeManager = IframeRouteManager.getInstance()
  iframeManager.clear()
  const iframeRoutes: AppRouteRecord[] = []

  const traverse = (routes: AppRouteRecord[]): void => {
    routes.forEach((route) => {
      if (route.meta?.isIframe) {
        iframeRoutes.push(route)
      }
      if (route.children?.length) {
        traverse(route.children)
      }
    })
  }

  traverse(menuList)
  iframeRoutes.forEach((route) => iframeManager.add(route))
  iframeManager.save()
}
