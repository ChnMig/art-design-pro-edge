import request from '@/utils/http'
import type { HttpClient } from '@/utils/http'

// 确保 request 对象类型正确
const httpClient = request as HttpClient

export const getCaptcha = (
  height: number,
  width: number
): Promise<{ id: string; image: string }> => {
  return httpClient.get({
    url: '/system/user/login/captcha',
    params: { height, width },
    showErrorMessage: false
  })
}

export const userLogin = (data: {
  username: string
  password: string
  captcha: string
  captcha_id: string
}): Promise<{ access_token: string; refresh_token?: string }> => {
  return httpClient.post({ url: '/system/user/login', data, showErrorMessage: false })
}

export const getUserInfo = (): Promise<any> => {
  return httpClient.get({ url: '/system/user/info', showErrorMessage: false })
}

export const updateUserInfo = (data: any): Promise<any> => {
  return httpClient.put({ url: '/system/user/info', data })
}

export const getUserMenu = (): Promise<any[]> => {
  return httpClient.get({ url: '/system/user/menu', showErrorMessage: false })
}

export const getAllMenu = (): Promise<any> => {
  return httpClient.get({ url: '/system/menu' })
}

// 添加菜单
export const addMenu = (data: any): Promise<any> => {
  return httpClient.post({ url: '/system/menu', data })
}

// 更新菜单
export const updateMenu = (data: any): Promise<any> => {
  return httpClient.put({ url: `/system/menu`, data })
}

// 删除菜单
export const deleteMenu = (id: string | number): Promise<any> => {
  return httpClient.del({ url: `/system/menu?id=${id}` })
}

// 新增权限
export const addAuth = (data: any): Promise<any> => {
  return httpClient.post({ url: '/system/menu/auth', data })
}

// 更新权限
export const updateAuth = (data: any): Promise<any> => {
  return httpClient.put({ url: `/system/menu/auth`, data })
}

// 删除权限
export const deleteAuth = (id: number): Promise<any> => {
  return httpClient.del({ url: `/system/menu/auth?id=${id}` })
}

// 获取权限列表
export const getAuthList = (menuID: number): Promise<any> => {
  return httpClient.get({ url: `/system/menu/auth?menu_id=${menuID}` })
}

export const getDepartmentList = (params?: any): Promise<any> => {
  return httpClient.get({
    url: '/system/department',
    params,
    keepFullResponse: true // 保持完整响应，包含total等分页信息
  })
}

export const addDepartment = (data: any): Promise<any> => {
  return httpClient.post({ url: '/system/department', data })
}

export const updateDepartment = (data: any): Promise<any> => {
  return httpClient.put({ url: '/system/department', data })
}

export const deleteDepartment = (id: number): Promise<any> => {
  return httpClient.del({ url: `/system/department?id=${id}` })
}

export const getRoleList = (params?: any): Promise<any> => {
  return httpClient.get({
    url: '/system/role',
    params,
    keepFullResponse: true // 保持完整响应，包含total等分页信息
  })
}

export const addRole = (data: any): Promise<any> => {
  return httpClient.post({ url: '/system/role', data })
}

export const updateRole = (data: any): Promise<any> => {
  return httpClient.put({ url: '/system/role', data })
}

export const deleteRole = (id: number): Promise<any> => {
  return httpClient.del({ url: `/system/role?id=${id}` })
}

export const getAllMenuByRole = (roleID: number): Promise<any> => {
  return httpClient.get({ url: `/system/menu/role?role_id=${roleID}` })
}

export const saveRolePermission = (data: any): Promise<any> => {
  return httpClient.put({ url: '/system/menu/role', data })
}

export const getUserList = (params: any): Promise<any> => {
  return httpClient.get({
    url: '/system/user',
    params,
    keepFullResponse: true // 保持完整响应，包含total等分页信息
  })
}

export const addUser = (data: any): Promise<any> => {
  return httpClient.post({ url: '/system/user', data })
}

export const updateUser = (data: any): Promise<any> => {
  return httpClient.put({ url: '/system/user', data })
}

export const deleteUser = (id: number): Promise<any> => {
  return httpClient.del({ url: `/system/user?id=${id}` })
}
