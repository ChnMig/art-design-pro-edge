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
