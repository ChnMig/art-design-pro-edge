<template>
  <div class="department-page art-full-height">
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
            t('pages.department.add')
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
      :title="dialogType === 'add' ? t('pages.department.add') : t('pages.department.edit')"
      width="520px"
      align-center
      :close-on-click-modal="false"
    >
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <ElFormItem :label="t('pages.department.name')" prop="name">
          <ElInput v-model="formData.name" :placeholder="t('pages.department.placeholder.name')" />
        </ElFormItem>
        <ElFormItem :label="t('pages.department.status')" prop="status">
          <ElRadioGroup v-model="formData.status">
            <ElRadio :label="1">{{ t('pages.department.enabled') }}</ElRadio>
            <ElRadio :label="2">{{ t('pages.department.disabled') }}</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem :label="t('pages.department.sort')" prop="sort">
          <ElInputNumber v-model="formData.sort" :min="0" :max="9999" :step="1" />
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
  import { useTable } from '@/composables/useTable'
  import { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import {
    fetchDepartmentList,
    createDepartment,
    updateDepartment,
    removeDepartment
  } from '@/api/department'

  defineOptions({ name: 'SystemDepartment' })
  const { t } = useI18n()

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)

  const tableApi = useTable<
    Api.SystemDepartment.DepartmentItem,
    Api.SystemDepartment.DepartmentSearchParams
  >({
    core: {
      apiFn: fetchDepartmentList,
      apiParams: {
        page: 1,
        page_size: 10,
        name: '',
        status: undefined
      },
      paginationKey: {
        current: 'page',
        size: 'page_size'
      },
      columnsFactory: () => [
        { type: 'index', width: 80, label: t('table.column.index') },
        { prop: 'name', label: t('pages.department.name'), align: 'center', width: 220 },
        {
          prop: 'status',
          label: t('pages.department.status'),
          align: 'center',
          width: 100,
          formatter: (row: Api.SystemDepartment.DepartmentItem) =>
            h(
              resolveComponent('ElTag'),
              { type: row.status === 1 ? 'success' : 'danger' },
              {
                default: () =>
                  row.status === 1 ? t('pages.department.enabled') : t('pages.department.disabled')
              }
            )
        },
        { prop: 'sort', label: t('pages.department.sort'), align: 'center', width: 100 },
        {
          prop: 'created_at',
          label: t('pages.department.createdAt'),
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemDepartment.DepartmentItem) => formatDate(row.created_at)
        },
        {
          prop: 'updated_at',
          label: t('pages.department.updatedAt'),
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemDepartment.DepartmentItem) => formatDate(row.updated_at)
        },
        {
          prop: 'operation',
          label: t('table.column.operation') || '操作',
          align: 'center',
          width: 140,
          fixed: 'right',
          formatter: (row: Api.SystemDepartment.DepartmentItem) =>
            h('div', { class: 'operation-column-container' }, [
              h(ArtButtonTable, {
                type: 'edit',
                style: 'margin-right: 8px;',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
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
      key: 'name',
      label: t('pages.department.name'),
      type: 'input',
      placeholder: t('pages.department.placeholder.name')
    },
    {
      key: 'status',
      label: t('pages.department.status'),
      type: 'select',
      props: {
        clearable: true,
        options: [
          { label: t('pages.department.all'), value: undefined },
          { label: t('pages.department.enabled'), value: 1 },
          { label: t('pages.department.disabled'), value: 2 }
        ]
      }
    }
  ])

  const formData = reactive<Api.SystemDepartment.DepartmentPayload>({
    id: 0,
    name: '',
    status: 1,
    sort: 1
  })

  const formRules: FormRules = {
    name: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const formRef = ref<FormInstance>()

  const handleRefresh = () => {
    refreshAll()
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.SystemDepartment.DepartmentItem) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      Object.assign(formData, {
        id: row.id,
        name: row.name,
        status: row.status,
        sort: row.sort ?? 1
      })
    } else {
      Object.assign(formData, {
        id: 0,
        name: '',
        status: 1,
        sort: 1
      })
    }

    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  const handleDelete = async (row: Api.SystemDepartment.DepartmentItem) => {
    try {
      await ElMessageBox.confirm(
        t('pages.department.confirmDelete', { name: row.name }),
        t('common.tips'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )

      await removeDepartment(row.id)
      ElMessage.success(t('pages.department.success.delete'))
      refreshAll()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除部门失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      const payload = { ...formData }

      if (dialogType.value === 'edit' && formData.id) {
        await updateDepartment(payload as Required<Api.SystemDepartment.DepartmentPayload>)
        ElMessage.success(t('pages.department.success.edit'))
      } else {
        await createDepartment(payload)
        ElMessage.success(t('pages.department.success.add'))
      }

      dialogVisible.value = false
      refreshAll()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(t('pages.department.error.submit'))
    }
  }

  const formatDate = (timestamp?: number | null) => {
    if (!timestamp) return '-'
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }
</script>

<style lang="scss" scoped>
  .department-page {
    .operation-column-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
