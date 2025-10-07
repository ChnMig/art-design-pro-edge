import request from '@/utils/http'
import type { HttpClient } from '@/utils/http'

const httpClient = request as HttpClient

const API_PREFIX = '/api/v1/admin/system'

type BackendListResponse<T> = Http.BaseResponse<T[]> & {
  total?: number
  current?: number
  page?: number
  pageSize?: number
  size?: number
}

const normalizePaginationParams = (params?: Record<string, any>) => {
  if (!params) return undefined
  const { current, size, page, pageSize, ...rest } = params

  return {
    ...rest,
    page: page ?? current ?? 1,
    pageSize: pageSize ?? size ?? 10
  }
}

export const getUserMenu = (): Promise<any[]> => {
  return httpClient.get({ url: `${API_PREFIX}/user/menu`, showErrorMessage: false })
}

export const getAllMenu = (): Promise<any> => {
  return httpClient.get({ url: `${API_PREFIX}/menu` })
}

export const addMenu = (data: any): Promise<any> => {
  return httpClient.post({ url: `${API_PREFIX}/menu`, data })
}

export const updateMenu = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/menu`, data })
}

export const deleteMenu = (id: string | number): Promise<any> => {
  return httpClient.del({ url: `${API_PREFIX}/menu`, data: { id } })
}

export const addAuth = (data: any): Promise<any> => {
  return httpClient.post({ url: `${API_PREFIX}/menu/auth`, data })
}

export const updateAuth = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/menu/auth`, data })
}

export const deleteAuth = (id: number): Promise<any> => {
  return httpClient.del({ url: `${API_PREFIX}/menu/auth`, data: { id } })
}

export const getAuthList = (menuID: number): Promise<any> => {
  return httpClient.get({ url: `${API_PREFIX}/menu/auth`, params: { menu_id: menuID } })
}

export const getDepartmentList = (
  params?: Record<string, any>
): Promise<BackendListResponse<Api.SystemDepartment.DepartmentItem>> => {
  return httpClient.get({
    url: `${API_PREFIX}/department`,
    params: normalizePaginationParams(params),
    keepFullResponse: true
  })
}

export const addDepartment = (data: any): Promise<any> => {
  return httpClient.post({ url: `${API_PREFIX}/department`, data })
}

export const updateDepartment = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/department`, data })
}

export const deleteDepartment = (id: number): Promise<any> => {
  return httpClient.del({ url: `${API_PREFIX}/department`, data: { id } })
}

export const getRoleList = (
  params?: Record<string, any>
): Promise<BackendListResponse<Api.SystemManage.RoleListItem>> => {
  return httpClient.get({
    url: `${API_PREFIX}/role`,
    params: normalizePaginationParams(params),
    keepFullResponse: true
  })
}

export const addRole = (data: any): Promise<any> => {
  return httpClient.post({ url: `${API_PREFIX}/role`, data })
}

export const updateRole = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/role`, data })
}

export const deleteRole = (id: number): Promise<any> => {
  return httpClient.del({ url: `${API_PREFIX}/role`, data: { id } })
}

export const getAllMenuByRole = (roleID: number): Promise<any> => {
  return httpClient.get({ url: `${API_PREFIX}/menu/role`, params: { role_id: roleID } })
}

export const saveRolePermission = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/menu/role`, data })
}

export const getUserList = (
  params: Record<string, any>
): Promise<BackendListResponse<Api.SystemManage.UserListItem>> => {
  return httpClient.get({
    url: `${API_PREFIX}/user`,
    params: normalizePaginationParams(params),
    keepFullResponse: true
  })
}

export const addUser = (data: any): Promise<any> => {
  return httpClient.post({ url: `${API_PREFIX}/user`, data })
}

export const updateUser = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/user`, data })
}

export const deleteUser = (id: number): Promise<any> => {
  return httpClient.del({ url: `${API_PREFIX}/user`, data: { id } })
}

export const getTenantList = (
  params?: Record<string, any>
): Promise<BackendListResponse<Api.SystemTenant.TenantItem>> => {
  return httpClient.get({
    url: `${API_PREFIX}/tenant`,
    params: normalizePaginationParams(params),
    keepFullResponse: true
  })
}

export const addTenant = (data: any): Promise<any> => {
  return httpClient.post({ url: `${API_PREFIX}/tenant`, data })
}

export const updateTenant = (data: any): Promise<any> => {
  return httpClient.put({ url: `${API_PREFIX}/tenant`, data })
}

export const deleteTenant = (id: number): Promise<any> => {
  return httpClient.del({ url: `${API_PREFIX}/tenant`, data: { id } })
}

export const getLoginLogList = (params?: any): Promise<any> => {
  return httpClient.get({
    url: `${API_PREFIX}/login/log`,
    params,
    keepFullResponse: true
  })
}
