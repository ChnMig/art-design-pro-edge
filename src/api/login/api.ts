import { getMethod } from '@/api/client'

export const getCaptcha = (height: number, width: number) => {
  return getMethod('/user/login/captcha', { height, width })
}
