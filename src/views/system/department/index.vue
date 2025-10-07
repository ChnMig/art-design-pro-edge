<template>
  <div class="department-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="searchParams"
      :items="searchItems"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refresh">
        <template #left>
          <ElButton @click="showDialog('add')">添加部门</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :table-config="{ rowKey: 'id' }"
        :layout="{ marginTop: 10 }"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 部门弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
        width="600px"
        align-center
        :close-on-click-modal="false"
        @closed="resetForm"
      >
        <ElForm ref="formRef" :model="formData" :rules="rules" label-width="85px">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="名称" prop="name">
                <ElInput v-model="formData.name" placeholder="请输入部门名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="排序" prop="sort">
                <ElInputNumber
                  v-model="formData.sort"
                  style="width: 100%"
                  :min="1"
                  controls-position="right"
                  placeholder="请输入排序号"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="启用" prop="status">
                <ElSwitch v-model="formData.status" />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="dialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="submitForm" :loading="submitLoading">提交</ElButton>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h, resolveComponent } from 'vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getDepartmentList,
    addDepartment,
    updateDepartment,
    deleteDepartment as apiDeleteDepartment
  } from '@/api/system/api'
  import { useTable } from '@/composables/useTable'
  import { SearchFormItem } from '@/types'

  // 搜索表单配置项
  const searchItems: SearchFormItem[] = [
    {
      label: '部门名称',
      key: 'name',
      type: 'input',
      span: 6,
      clearable: true,
      placeholder: '请输入部门名称'
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      span: 6,
      clearable: true,
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 }
      ]
    }
  ]

  // 表单数据
  const formData = reactive({
    name: '',
    sort: '1',
    status: true
  })
  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const currentId = ref<number | null>(null)
  const formRef = ref<FormInstance>()

  // 表单验证规则
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    sort: [
      { required: true, message: '请输入排序号', trigger: 'blur' },
      { pattern: /^[0-9]*$/, message: '请输入数字', trigger: 'blur' }
    ]
  })

  // useTable 适配
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData: getDataByPage,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshAll: refresh
  } = useTable<any>({
    core: {
      apiFn: getDepartmentList,
      apiParams: {
        page: 1,
        pageSize: 10,
        name: '',
        status: undefined
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '名称',
          align: 'center'
        },
        {
          prop: 'sort',
          label: '排序',
          sortable: true,
          align: 'center'
        },
        {
          prop: 'users',
          label: '人数',
          align: 'center',
          formatter: (row: any) => (Array.isArray(row.users) ? row.users.length : 0)
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          formatter: (row: any) =>
            h(
              resolveComponent('ElTag'),
              { type: row.status === 1 ? 'primary' : 'warning' },
              { default: () => (row.status === 1 ? '启用' : '禁用') }
            )
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
                onClick: () => deleteDepartment(row.id)
              })
            ])
        }
      ]
    },
    hooks: {
      onError: (error) => ElMessage.error(error.message)
    }
  })

  // 弹窗相关
  const resetForm = () => {
    formData.name = ''
    formData.sort = '1'
    formData.status = true
    currentId.value = null
  }

  const showDialog = (type: string, row?: any) => {
    dialogType.value = type
    dialogVisible.value = true
    if (type === 'edit' && row) {
      currentId.value = row.id
      formData.name = row.name
      formData.sort = String(row.sort)
      formData.status = row.status === 1
    } else {
      resetForm()
    }
  }

  // 删除部门
  const deleteDepartment = (id: number) => {
    ElMessageBox.confirm('确定要删除该部门吗？', '删除部门', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        loading.value = true
        try {
          await apiDeleteDepartment(id)
          // HTTP client returns data directly on success
          ElMessage.success('删除部门成功')
          await refresh()
        } catch (err) {
          console.error('删除部门出错:', err)
          ElMessage.error('删除部门失败')
        } finally {
          loading.value = false
        }
      })
      .catch(() => {})
  }

  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          const params = {
            name: formData.name,
            sort: parseInt(formData.sort),
            status: formData.status ? 1 : 0
          }
          if (dialogType.value === 'edit') {
            if (!currentId.value) {
              ElMessage.error('部门ID无效')
              return
            }
            await updateDepartment({ ...params, id: currentId.value })
            // HTTP client returns data directly on success
            ElMessage.success('修改部门成功')
            dialogVisible.value = false
            await refresh()
          } else {
            await addDepartment(params)
            // HTTP client returns data directly on success
            ElMessage.success('添加部门成功')
            dialogVisible.value = false
            await refresh()
          }
        } catch (err) {
          console.error('提交表单出错:', err)
          ElMessage.error(`${dialogType.value === 'add' ? '添加' : '修改'}部门失败`)
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .department-page {
    .table-container {
      flex: 1;
      min-height: 0;
      padding: 16px;
    }

    .search-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .el-input {
        width: 240px;
        margin-right: 16px;
      }
    }

    .operation-column-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
  }
</style>
