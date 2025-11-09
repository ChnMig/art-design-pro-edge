import request from '@/utils/http'

// 统一的基础路径前缀
const TENANT_BASE = '/api/v1/private/admin/system/tenant'

// 适配最新 API：GET /api/v1/private/admin/system/tenant
// 后端返回形如 { code, status/message, data: [], total }，此处做结构适配为 { data: { records, total, page, page_size } }
export async function fetchTenantList(params?: Api.SystemTenant.TenantSearchParams) {
  const res = await request.get<any>({
    url: TENANT_BASE,
    params,
    keepFullResponse: true
  })

  const rawRecords: any[] = Array.isArray(res?.data) ? res.data : []
  // 字段适配：后端 expired_at -> 前端 expires_at
  const records: Api.SystemTenant.TenantItem[] = rawRecords.map((item) => ({
    ...item,
    expires_at: item?.expires_at ?? item?.expired_at ?? item?.expiredAt ?? undefined
  }))
  const total: number = typeof res?.total === 'number' ? res.total : records.length
  const page = params?.page ?? 1
  const size = params?.page_size ?? 10

  return {
    data: {
      records,
      total,
      page,
      page_size: size
    }
  } as any
}

// 适配最新 API：POST /api/v1/private/admin/system/tenant
export function createTenant(data: Api.SystemTenant.TenantPayload) {
  const payload = {
    ...data,
    expired_at: (data as any).expired_at ?? (data as any).expires_at,
    expires_at: undefined
  }
  return request.post({
    url: TENANT_BASE,
    data: payload,
    showSuccessMessage: true,
    successMessage: '新增成功'
  })
}

// 适配最新 API：PUT /api/v1/private/admin/system/tenant
export function updateTenant(data: Required<Api.SystemTenant.TenantPayload>) {
  const payload = {
    ...data,
    expired_at: (data as any).expired_at ?? (data as any).expires_at,
    expires_at: undefined
  }
  return request.put({
    url: TENANT_BASE,
    data: payload,
    showSuccessMessage: true,
    successMessage: '更新成功'
  })
}

// 适配最新 API：DELETE /api/v1/private/admin/system/tenant，按文档以 JSON 体传递 { id }
export function removeTenant(id: number) {
  return request.del({
    url: TENANT_BASE,
    data: { id },
    showSuccessMessage: true,
    successMessage: '删除成功'
  })
}
