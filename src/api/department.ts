import request from '@/utils/http'

const DEPT_BASE = '/api/v1/private/admin/system/department'

export async function fetchDepartmentList(params?: Api.SystemDepartment.DepartmentSearchParams) {
  // 兼容 page/page_size 与 pageSize 两种命名
  const query = {
    ...params,
    page: params?.page ?? params?.page,
    page_size: params?.page_size ?? params?.pageSize,
    pageSize: params?.pageSize ?? params?.page_size
  }

  const res = await request.get<any>({
    url: DEPT_BASE,
    params: query,
    keepFullResponse: true
  })

  const raw: any[] = Array.isArray(res?.data) ? res.data : []
  const records: Api.SystemDepartment.DepartmentItem[] = raw.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    sort: item.sort,
    created_at: item.created_at,
    updated_at: item.updated_at
  }))

  const total: number = typeof res?.total === 'number' ? res.total : records.length
  const page = params?.page ?? 1
  const size = params?.page_size ?? params?.pageSize ?? 10

  return {
    data: {
      records,
      total,
      page,
      page_size: size
    }
  } as any
}

export function createDepartment(data: Api.SystemDepartment.DepartmentPayload) {
  return request.post({
    url: DEPT_BASE,
    data,
    showSuccessMessage: true,
    successMessage: '新增成功'
  })
}

export function updateDepartment(data: Required<Api.SystemDepartment.DepartmentPayload>) {
  return request.put({
    url: DEPT_BASE,
    data,
    showSuccessMessage: true,
    successMessage: '更新成功'
  })
}

export function removeDepartment(id: number) {
  return request.del({
    url: DEPT_BASE,
    data: { id },
    showSuccessMessage: true,
    successMessage: '删除成功'
  })
}
