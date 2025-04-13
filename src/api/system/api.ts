import api from '@/api/client'
import { ApiResponse } from '@/api/client'

export const getCaptcha = (height: number, width: number): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/login/captcha', params: { height, width } })
}

export const userLogin = (data: {
  username: string
  password: string
  captcha: string
  captcha_id: string
}): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/user/login', data })
}

export const getUserInfo = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/info' })
}

export const updateUserInfo = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: '/system/user/info', data })
}

export const getUserMenu = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/menu' })
}

export const getAllMenu = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/menu' })
}

// 添加菜单
export const addMenu = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/menu', data })
}

// 更新菜单
export const updateMenu = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: `/system/menu`, data })
}

// 删除菜单
export const deleteMenu = (id: string | number): Promise<ApiResponse<ApiResponse>> => {
  return api.del({ url: `/system/menu?id=${id}` })
}

// 新增权限
export const addAuth = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/menu/auth', data })
}

// 更新权限
export const updateAuth = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: `/system/menu/auth`, data })
}

// 删除权限
export const deleteAuth = (id: number): Promise<ApiResponse<ApiResponse>> => {
  return api.del({ url: `/system/menu/auth?id=${id}` })
}

// 获取权限列表
export const getAuthList = (menuID: number): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: `/system/menu/auth?menu_id=${menuID}` })
}

export const getDepartmentList = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/department' })
}

export const addDepartment = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/department', data })
}

export const updateDepartment = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: '/system/department', data })
}

export const deleteDepartment = (id: number): Promise<ApiResponse<ApiResponse>> => {
  return api.del({ url: `/system/department?id=${id}` })
}

export const getRoleList = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/role' })
}

export const addRole = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/role', data })
}

export const updateRole = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: '/system/role', data })
}

export const deleteRole = (id: number): Promise<ApiResponse<ApiResponse>> => {
  return api.del({ url: `/system/role?id=${id}` })
}

export const getAllMenuByRole = (roleID: number): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: `/system/menu/role?role_id=${roleID}` })
}

export const saveRolePermission = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: '/system/menu/role', data })
}

export const getUserList = (params: any): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user', params })
}

export const addUser = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/user', data })
}

export const updateUser = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: '/system/user', data })
}

export const deleteUser = (id: number): Promise<ApiResponse<ApiResponse>> => {
  return api.del({ url: `/system/user?id=${id}` })
}

export const getTodoList = (params: any): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/todo', params })
}
export const addTodo = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/todo', data })
}
export const updateTodo = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.put({ url: '/system/todo', data })
}
export const deleteTodo = (id: number): Promise<ApiResponse<ApiResponse>> => {
  return api.del({ url: `/system/todo?id=${id}` })
}

export const getUserCache = (params: any = {}): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/cache', params })
}

export const getTodoComment = (params: any): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/todo/comment', params })
}

export const addTodoComment = (data: any): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/todo/comment', data })
}
