import { getMethod, postMethod } from '@/api/client'

export const getCaptcha = (height: number, width: number) => {
  return getMethod('/system/login/captcha', { height, width })
}

export const login = (data: {
  username: string
  password: string
  captcha: string
  captcha_id: string
}) => {
  return postMethod('/system/login', data)
}
