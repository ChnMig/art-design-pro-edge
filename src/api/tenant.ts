import request from '@/utils/http'

export function fetchTenantList(params?: Api.SystemTenant.TenantSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.SystemTenant.TenantItem>>({
    url: '/system/tenant',
    params,
    keepFullResponse: true
  })
}

export function createTenant(data: Api.SystemTenant.TenantPayload) {
  return request.post({
    url: '/system/tenant',
    data,
    showSuccessMessage: true,
    successMessage: '新增成功'
  })
}

export function updateTenant(data: Required<Api.SystemTenant.TenantPayload>) {
  return request.put({
    url: '/system/tenant',
    data,
    showSuccessMessage: true,
    successMessage: '更新成功'
  })
}

export function removeTenant(id: number) {
  return request.del({
    url: `/system/tenant?id=${id}`,
    showSuccessMessage: true,
    successMessage: '删除成功'
  })
}
