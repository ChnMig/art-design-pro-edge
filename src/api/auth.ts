import request from '@/utils/http'

/**
 * 获取验证码
 */
export function fetchCaptcha(height: number, width: number) {
  return request.get<{ id: string; image: string }>({
    url: '/system/user/login/captcha',
    params: { height, width },
    showErrorMessage: false
  })
}

/**
 * 登录
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/system/user/login',
    data: params,
    showErrorMessage: false
  })
}

/**
 * 获取用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/system/user/info',
    showErrorMessage: false
  })
}
