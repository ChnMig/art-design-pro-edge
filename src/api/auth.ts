import request from '@/utils/http'

/**
 * 获取验证码
 * 新接口：GET /api/v1/admin/system/user/login/captcha
 * 可选的 height/width 将作为查询参数传递（若后端忽略也无副作用）
 */
export async function fetchCaptcha(
  height?: number,
  width?: number
): Promise<{ captcha_id: string; image: string }> {
  const params =
    typeof height === 'number' && typeof width === 'number' ? { height, width } : undefined
  const data = await request.get<any>({
    url: '/api/v1/admin/system/user/login/captcha',
    params,
    showErrorMessage: false
  })
  const captcha_id: string = data?.captcha_id ?? data?.id ?? data?.captchaId ?? ''
  const image: string = data?.image ?? data?.img ?? ''
  return { captcha_id, image }
}

/**
 * 登录
 * 新接口：POST /api/v1/admin/system/user/login
 */
export async function fetchLogin(params: Api.Auth.LoginParams): Promise<Api.Auth.LoginResponse> {
  const res = await request.post<any>({
    url: '/api/v1/admin/system/user/login',
    data: params,
    showErrorMessage: false
  })

  // 后端返回可能为 access_token，做兼容映射
  const token = res?.access_token ?? res?.token ?? ''
  const expires = res?.expires ?? res?.expires_in
  return { token, expires }
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

/**
 * 登录页租户编码模糊查询
 * GET /api/v1/admin/system/user/login/tenant?code=xxx
 */
export function searchTenant(code: string) {
  return request.get<Api.Auth.TenantItem[]>({
    url: '/api/v1/admin/system/user/login/tenant',
    params: { code },
    showErrorMessage: false
  })
}
