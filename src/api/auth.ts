import request from '@/utils/http'

/**
 * 获取验证码
 * 新接口：GET /api/v1/admin/system/user/login/captcha
 * 可选的 height/width 将作为查询参数传递（若后端忽略也无副作用）
 */
export function fetchCaptcha(height?: number, width?: number) {
  const params =
    typeof height === 'number' && typeof width === 'number' ? { height, width } : undefined
  return request.get<{ captcha_id: string; image: string }>({
    url: '/api/v1/admin/system/user/login/captcha',
    params,
    showErrorMessage: false
  })
}

/**
 * 登录
 * 新接口：POST /api/v1/admin/system/user/login
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/v1/admin/system/user/login',
    data: params,
    showErrorMessage: false
  })
}

/**
 * 获取用户信息
 * 新接口：GET /api/v1/admin/system/user/info
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/v1/admin/system/user/info',
    showErrorMessage: false
  })
}
