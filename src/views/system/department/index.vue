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
          <ElButton type="primary" @click="showDialog('add')" v-ripple>新增部门</ElButton>
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
      :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
      width="520px"
      align-center
      :close-on-click-modal="false"
    >
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <ElFormItem label="部门名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入部门名称" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="formData.status">
            <ElRadio :label="1">启用</ElRadio>
            <ElRadio :label="2">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="排序" prop="sort">
          <ElInputNumber v-model="formData.sort" :min="0" :max="9999" :step="1" />
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
        { type: 'index', width: 80, label: '序号' },
        { prop: 'name', label: '部门名称', align: 'center', width: 220 },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          width: 100,
          formatter: (row: Api.SystemDepartment.DepartmentItem) =>
            h(
              resolveComponent('ElTag'),
              { type: row.status === 1 ? 'success' : 'danger' },
              { default: () => (row.status === 1 ? '启用' : '禁用') }
            )
        },
        { prop: 'sort', label: '排序', align: 'center', width: 100 },
        {
          prop: 'created_at',
          label: '创建时间',
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemDepartment.DepartmentItem) => formatDate(row.created_at)
        },
        {
          prop: 'updated_at',
          label: '更新时间',
          align: 'center',
          width: 180,
          formatter: (row: Api.SystemDepartment.DepartmentItem) => formatDate(row.updated_at)
        },
        {
          prop: 'operation',
          label: '操作',
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
      label: '部门名称',
      type: 'input',
      placeholder: '请输入部门名称'
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
          { label: '禁用', value: 2 }
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
      await ElMessageBox.confirm(`确认删除部门 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await removeDepartment(row.id)
      ElMessage.success('删除成功')
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
        ElMessage.success('更新成功')
      } else {
        await createDepartment(payload)
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
  .department-page {
    .operation-column-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
