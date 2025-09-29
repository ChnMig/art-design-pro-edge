<template>
  <div class="tenant-page art-full-height">
    <ArtSearchBar
      v-model="searchState"
      :items="searchItems"
      @reset="resetSearch"
      @search="searchData"
    />

    <ElCard shadow="never" class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="handleRefresh">
        <template #left>
          <ElButton type="primary" @click="showDialog('add')" v-ripple>新增租户</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :data="tableData"
        :columns="columns"
        :pagination="paginationState"
        :loading="isLoading"
        :table-config="{ rowKey: 'id' }"
        :layout="{ marginTop: 10 }"
        @pagination:size-change="onPageSizeChange"
        @pagination:current-change="onCurrentPageChange"
      />
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增租户' : '编辑租户'"
      width="600px"
      align-center
      :close-on-click-modal="false"
    >
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem label="租户编码" prop="code">
          <ElInput
            v-model="formData.code"
            :disabled="dialogType === 'edit'"
            placeholder="请输入租户编码"
          />
        </ElFormItem>
        <ElFormItem label="租户名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入租户名称" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="formData.description"
            type="textarea"
            placeholder="请输入描述"
            :rows="3"
          />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="formData.status">
            <ElRadio :label="1">启用</ElRadio>
            <ElRadio :label="0">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="到期时间" prop="expires_at">
          <ElDatePicker
            v-model="formData.expires_at"
            type="datetime"
            placeholder="选择到期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="X"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取 消</ElButton>
          <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, nextTick, reactive, ref, resolveComponent } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchTenantList, createTenant, updateTenant, removeTenant } from '@/api/tenant'
  import { useTable } from '@/composables/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'

  defineOptions({ name: 'SystemTenant' })

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)

  const tableApi = useTable<Api.SystemTenant.TenantItem, Api.SystemTenant.TenantSearchParams>({
    core: {
      apiFn: fetchTenantList,
      apiParams: {
        page: 1,
        page_size: 10,
        code: '',
        name: '',
        status: undefined
      },
      paginationKey: {
        current: 'page',
        size: 'page_size'
      },
      columnsFactory: () => [
        { type: 'index', width: 80, label: '序号' },
        { prop: 'code', label: '租户编码', align: 'center', width: 150 },
        { prop: 'name', label: '租户名称', align: 'center', width: 200 },
        {
          prop: 'description',
          label: '描述',
          align: 'center',
          showOverflowTooltip: true
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          width: 100,
          formatter: (row: Api.SystemTenant.TenantItem) =>
            h(
              resolveComponent('ElTag'),
              { type: row.status === 1 ? 'success' : 'danger' },
              { default: () => (row.status === 1 ? '启用' : '禁用') }
            )
        },
        {
          prop: 'expires_at',
          label: '到期时间',
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemTenant.TenantItem) => formatDate(row.expires_at)
        },
        {
          prop: 'created_at',
          label: '创建时间',
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemTenant.TenantItem) => formatDate(row.created_at)
        },
        {
          prop: 'operation',
          label: '操作',
          align: 'center',
          width: 140,
          fixed: 'right',
          formatter: (row: Api.SystemTenant.TenantItem) =>
            h('div', { class: 'operation-column-container' }, [
              h(ArtButtonTable, {
                type: 'edit',
                style: 'margin-right: 8px;',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                disabled: row.code === 'default',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    },
    transform: {
      responseAdapter: (response) => {
        const data: any = response ?? {}
        const source = data?.data ?? data
        const records = Array.isArray(source?.records)
          ? source.records
          : Array.isArray(source?.list)
            ? source.list
            : Array.isArray(source?.items)
              ? source.items
              : []
        return {
          records,
          total: source?.total ?? data?.total ?? records.length,
          current: source?.page ?? data?.page ?? 1,
          size: source?.page_size ?? source?.size ?? data?.page_size ?? data?.size ?? 10
        }
      }
    },
    hooks: {
      onError: (error) => ElMessage.error(error.message)
    }
  })

  const {
    tableData,
    isLoading,
    columns,
    columnChecks,
    paginationState,
    searchState,
    searchData,
    resetSearch,
    onPageSizeChange,
    onCurrentPageChange,
    refreshAll
  } = tableApi

  const searchItems = computed<SearchFormItem[]>(() => [
    {
      key: 'code',
      label: '租户编码',
      type: 'input',
      placeholder: '请输入租户编码'
    },
    {
      key: 'name',
      label: '租户名称',
      type: 'input',
      placeholder: '请输入租户名称'
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      props: {
        clearable: true,
        options: [
          { label: '全部', value: undefined },
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 }
        ]
      }
    }
  ])

  const formData = reactive<Api.SystemTenant.TenantPayload>({
    id: 0,
    code: '',
    name: '',
    description: '',
    status: 1,
    expires_at: undefined
  })

  const formRules: FormRules = {
    code: [
      { required: true, message: '请输入租户编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入租户名称', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    description: [{ max: 255, message: '长度不能超过 255 个字符', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const formRef = ref<FormInstance>()

  const handleRefresh = () => {
    refreshAll()
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.SystemTenant.TenantItem) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      Object.assign(formData, {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        status: row.status,
        expires_at: row.expires_at
      })
    } else {
      Object.assign(formData, {
        id: 0,
        code: '',
        name: '',
        description: '',
        status: 1,
        expires_at: undefined
      })
    }

    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  const handleDelete = async (row: Api.SystemTenant.TenantItem) => {
    if (row.code === 'default') {
      ElMessage.warning('默认租户不能删除')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除租户 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await removeTenant(row.id)
      ElMessage.success('删除成功')
      refreshAll()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除租户失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      const payload = {
        ...formData,
        expires_at: formData.expires_at ? Number(formData.expires_at) : undefined
      }

      if (dialogType.value === 'edit' && formData.id) {
        await updateTenant(payload as Required<Api.SystemTenant.TenantPayload>)
        ElMessage.success('更新成功')
      } else {
        await createTenant(payload)
        ElMessage.success('新增成功')
      }

      dialogVisible.value = false
      refreshAll()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    }
  }

  const formatDate = (timestamp?: number | null) => {
    if (!timestamp) return '-'
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }
</script>

<style lang="scss" scoped>
  .tenant-page {
    .operation-column-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
