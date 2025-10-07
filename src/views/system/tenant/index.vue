<template>
  <div class="tenant-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="searchState"
      :items="searchItems"
      @reset="resetSearch"
      @search="searchData"
    />

    <ElCard shadow="never" class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader
        :columnList="columnOptions"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton @click="showDialog('add')" v-ripple>新增租户</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
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
  import { ref, reactive, nextTick, h, resolveComponent, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getTenantList, addTenant, updateTenant, deleteTenant } from '@/api/system/api'
  import { useTable } from '@/composables/useTable'
  import { SearchFormItem } from '@/types'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'SystemTenant' })

  // 状态变量
  const dialogType = ref('add')
  const dialogVisible = ref(false)

  // useTable 适配
  const tableApi = useTable<any>({
    core: {
      apiFn: getTenantList,
      apiParams: {
        page: 1,
        page_size: 10,
        code: '',
        name: '',
        status: undefined
      },
      columnsFactory: () => [
        { type: 'index', width: 80, label: '序号' },
        {
          prop: 'code',
          label: '租户编码',
          align: 'center',
          width: 150
        },
        {
          prop: 'name',
          label: '租户名称',
          align: 'center',
          width: 200
        },
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
          formatter: (row: any) =>
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
          formatter: (row: any) => (row.expires_at ? formatDate(row.expires_at) : '永不过期')
        },
        {
          prop: 'created_at',
          label: '创建时间',
          align: 'center',
          width: 180,
          formatter: (row: any) => formatDate(row.created_at)
        },
        {
          prop: 'operation',
          label: '操作',
          align: 'center',
          width: 120,
          fixed: 'right',
          formatter: (row: any) =>
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
    onCurrentPageChange
  } = tableApi
  const refreshAll = tableApi.refreshAll

  // 表单数据
  const formData = reactive({
    id: 0,
    code: '',
    name: '',
    description: '',
    status: 1,
    expires_at: undefined as string | undefined
  })

  // 搜索表单配置项
  const searchItems: SearchFormItem[] = [
    {
      label: '租户编码',
      key: 'code',
      type: 'input',
      span: 6,
      clearable: true,
      placeholder: '请输入租户编码'
    },
    {
      label: '租户名称',
      key: 'name',
      type: 'input',
      span: 6,
      clearable: true,
      placeholder: '请输入租户名称'
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      span: 6,
      clearable: true,
      placeholder: '请选择状态',
      options: () => [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]

  // 列配置选项
  const columnOptions = [
    { label: '租户编码', prop: 'code' },
    { label: '租户名称', prop: 'name' },
    { label: '描述', prop: 'description' },
    { label: '状态', prop: 'status' },
    { label: '到期时间', prop: 'expires_at' },
    { label: '创建时间', prop: 'created_at' },
    { label: '操作', prop: 'operation' }
  ]

  // 表单验证规则
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

  // 表单实例引用
  const formRef = ref<FormInstance>()

  // 刷新表格数据
  const handleRefresh = () => {
    refreshAll()
  }

  // 显示对话框
  const showDialog = (type: string, row?: any) => {
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
      // 新增时重置表单
      Object.assign(formData, {
        id: 0,
        code: '',
        name: '',
        description: '',
        status: 1,
        expires_at: undefined
      })
    }

    // 清空验证
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    })
  }

  // 删除租户
  const handleDelete = async (row: any) => {
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

      await deleteTenant(row.id)
      ElMessage.success('删除成功')
      refreshAll()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除租户失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      const data = {
        ...formData,
        expires_at: formData.expires_at ? parseInt(formData.expires_at) : undefined
      }

      if (dialogType.value === 'edit') {
        await updateTenant(data)
        ElMessage.success('更新成功')
      } else {
        await addTenant(data)
        ElMessage.success('新增成功')
      }

      dialogVisible.value = false
      refreshAll()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    }
  }

  // 格式化时间
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-'
    return new Date(timestamp * 1000).toLocaleString()
  }

  // 初始化
  onMounted(() => {
    // 组件挂载时会自动加载数据
  })
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
