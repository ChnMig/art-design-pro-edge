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
          <ElButton type="primary" @click="showDialog('add')" v-ripple>{{
            t('pages.tenant.add')
          }}</ElButton>
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
      :title="dialogType === 'add' ? t('pages.tenant.add') : t('pages.tenant.edit')"
      width="600px"
      align-center
      :close-on-click-modal="false"
    >
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem :label="t('pages.tenant.code')" prop="code">
          <ElInput
            v-model="formData.code"
            :disabled="dialogType === 'edit'"
            :placeholder="t('pages.tenant.placeholder.code')"
          />
        </ElFormItem>
        <ElFormItem :label="t('pages.tenant.name')" prop="name">
          <ElInput v-model="formData.name" :placeholder="t('pages.tenant.placeholder.name')" />
        </ElFormItem>
        <ElFormItem :label="t('pages.tenant.description')" prop="description">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :placeholder="t('pages.tenant.placeholder.description')"
            :rows="3"
          />
        </ElFormItem>
        <ElFormItem :label="t('pages.tenant.status')" prop="status">
          <ElRadioGroup v-model="formData.status">
            <ElRadio :label="1">{{ t('pages.tenant.enabled') }}</ElRadio>
            <ElRadio :label="0">{{ t('pages.tenant.disabled') }}</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem :label="t('pages.tenant.expiresAt')" prop="expires_at">
          <ElDatePicker
            v-model="formData.expires_at"
            type="datetime"
            :placeholder="t('pages.tenant.placeholder.expiresAt')"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="X"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">{{ t('common.cancel') }}</ElButton>
          <ElButton type="primary" @click="handleSubmit">{{ t('common.confirm') }}</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, nextTick, reactive, ref, resolveComponent } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchTenantList, createTenant, updateTenant, removeTenant } from '@/api/tenant'
  import { useTable } from '@/composables/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'

  defineOptions({ name: 'SystemTenant' })
  const { t } = useI18n()

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
        { type: 'index', width: 80, label: t('table.column.index') },
        { prop: 'code', label: t('pages.tenant.code'), align: 'center', width: 150 },
        { prop: 'name', label: t('pages.tenant.name'), align: 'center', width: 200 },
        {
          prop: 'description',
          label: t('pages.tenant.description'),
          align: 'center',
          showOverflowTooltip: true
        },
        {
          prop: 'status',
          label: t('pages.tenant.status'),
          align: 'center',
          width: 100,
          formatter: (row: Api.SystemTenant.TenantItem) =>
            h(
              resolveComponent('ElTag'),
              { type: row.status === 1 ? 'success' : 'danger' },
              {
                default: () =>
                  row.status === 1 ? t('pages.tenant.enabled') : t('pages.tenant.disabled')
              }
            )
        },
        {
          prop: 'expires_at',
          label: t('pages.tenant.expiresAt'),
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemTenant.TenantItem) => formatDate(row.expires_at)
        },
        {
          prop: 'created_at',
          label: t('pages.tenant.createdAt'),
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemTenant.TenantItem) => formatDate(row.created_at)
        },
        {
          prop: 'operation',
          label: t('table.column.operation') || '操作',
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
      label: t('pages.tenant.code'),
      type: 'input',
      placeholder: t('pages.tenant.placeholder.code')
    },
    {
      key: 'name',
      label: t('pages.tenant.name'),
      type: 'input',
      placeholder: t('pages.tenant.placeholder.name')
    },
    {
      key: 'status',
      label: t('pages.tenant.status'),
      type: 'select',
      props: {
        clearable: true,
        options: [
          { label: t('pages.tenant.all'), value: undefined },
          { label: t('pages.tenant.enabled'), value: 1 },
          { label: t('pages.tenant.disabled'), value: 0 }
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
      { required: true, message: t('pages.tenant.rules.codeRequired'), trigger: 'blur' },
      { min: 2, max: 50, message: t('pages.tenant.rules.codeLength'), trigger: 'blur' }
    ],
    name: [
      { required: true, message: t('pages.tenant.rules.nameRequired'), trigger: 'blur' },
      { min: 2, max: 100, message: t('pages.tenant.rules.nameLength'), trigger: 'blur' }
    ],
    description: [{ max: 255, message: t('pages.tenant.rules.descMax'), trigger: 'blur' }],
    status: [{ required: true, message: t('pages.tenant.rules.statusRequired'), trigger: 'change' }]
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
      ElMessage.warning(t('pages.tenant.error.defaultTenantDelete'))
      return
    }

    try {
      await ElMessageBox.confirm(
        t('pages.tenant.confirmDelete', { name: row.name }),
        t('common.tips'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )

      await removeTenant(row.id)
      ElMessage.success(t('pages.tenant.success.delete'))
      refreshAll()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除租户失败:', error)
        ElMessage.error(t('pages.tenant.error.delete'))
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
        ElMessage.success(t('pages.tenant.success.edit'))
      } else {
        await createTenant(payload)
        ElMessage.success(t('pages.tenant.success.add'))
      }

      dialogVisible.value = false
      refreshAll()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(t('pages.tenant.error.submit'))
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
