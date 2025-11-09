import request from '@/utils/http'
import type { HttpClient } from '@/utils/http'

const http = request as HttpClient

const API_PREFIX = '/api/v1/private/admin/platform'

// 平台菜单（仅定义，不带 hasPermission）
export const getPlatformMenu = (): Promise<any> => {
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

// 保存租户菜单范围（与定义共用同一路径，通过 tenant_id + menu_data 区分）
// 平台：租户菜单范围（独立接口）
export const getPlatformTenantMenu = (tenant_id: number): Promise<any> => {
  return http.get({
    url: `${API_PREFIX}/menu/tenant`,
    params: { tenant_id },
    showErrorMessage: false
  })
}

export const savePlatformTenantMenu = (data: {
  tenant_id: number
  menu_data: string
}): Promise<any> => {
  return http.put({ url: `${API_PREFIX}/menu/tenant`, data })
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
  getPlatformTenantMenu,
  savePlatformTenantMenu
}
