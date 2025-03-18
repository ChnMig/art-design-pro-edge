import { getMethod, postMethod } from '@/api/client'

export const getCaptcha = (height: number, width: number) => {
  return getMethod('/system/user/login/captcha', { height, width })
}

export const userLogin = (data: {
  username: string
  password: string
  captcha: string
  captcha_id: string
}) => {
  return postMethod('/system/user/login', data)
}

export const getUserInfo = () => {
  return getMethod('/system/user/info')
}
