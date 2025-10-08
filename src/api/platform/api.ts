import request from '@/utils/http'
import type { HttpClient } from '@/utils/http'

const http = request as HttpClient

const API_PREFIX = '/api/v1/admin/platform'

// 平台菜单（全局定义 + 范围分配）
export const getPlatformMenu = (): Promise<any[]> => {
  return http.get({ url: `${API_PREFIX}/menu`, showErrorMessage: false })
}

export const addPlatformMenu = (data: any): Promise<any> => {
  return http.post({ url: `${API_PREFIX}/menu`, data })
}

export const updatePlatformMenu = (data: any): Promise<any> => {
  return http.put({ url: `${API_PREFIX}/menu`, data })
}

export const deletePlatformMenu = (id: number | string): Promise<any> => {
  return http.del({ url: `${API_PREFIX}/menu`, data: { id } })
}

// 平台菜单元素权限
export const getPlatformMenuAuth = (menu_id: number): Promise<any> => {
  return http.get({ url: `${API_PREFIX}/menu/auth`, params: { menu_id } })
}

export const addPlatformMenuAuth = (data: any): Promise<any> => {
  return http.post({ url: `${API_PREFIX}/menu/auth`, data })
}

export const updatePlatformMenuAuth = (data: any): Promise<any> => {
  return http.put({ url: `${API_PREFIX}/menu/auth`, data })
}

export const deletePlatformMenuAuth = (id: number): Promise<any> => {
  return http.del({ url: `${API_PREFIX}/menu/auth`, data: { id } })
}

// 平台菜单范围（为租户分配可用菜单集合）
export const getPlatformMenuScope = (tenant_id: number): Promise<any> => {
  return http.get({
    url: `${API_PREFIX}/menu/scope`,
    params: { tenant_id },
    showErrorMessage: false
  })
}

export const updatePlatformMenuScope = (data: {
  tenant_id: number
  menu_ids: number[]
}): Promise<any> => {
  return http.put({ url: `${API_PREFIX}/menu/scope`, data })
}

export default {
  getPlatformMenu,
  addPlatformMenu,
  updatePlatformMenu,
  deletePlatformMenu,
  getPlatformMenuAuth,
  addPlatformMenuAuth,
  updatePlatformMenuAuth,
  deletePlatformMenuAuth,
  getPlatformMenuScope,
  updatePlatformMenuScope
}
