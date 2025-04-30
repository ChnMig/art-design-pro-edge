<template>
  <ArtTableFullScreen>
    <div class="department-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="searchForm"
        :items="searchItems"
        @reset="resetSearch"
        @search="search"
      ></ArtSearchBar>

      <ElCard shadow="never" class="art-table-card">
        <!-- 表格头部 -->
        <ArtTableHeader
          :columnList="columnOptions"
          v-model:columns="columnChecks"
          @refresh="handleRefresh"
        >
          <template #left>
            <ElButton @click="showDialog('add')" v-ripple>添加部门</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :data="filteredData"
          :currentPage="pagination.currentPage"
          :pageSize="pagination.pageSize"
          :total="pagination.total"
          :loading="loading"
          :hideOnSinglePage="false"
          :marginTop="10"
          height="100%"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        >
          <template #default>
            <el-table-column
              v-for="col in filteredColumns"
              :key="col.prop || col.type"
              v-bind="col"
            >
              <!-- 自定义人数列的渲染 -->
              <template #default="scope" v-if="col.prop === 'users'">
                {{ Array.isArray(scope.row.users) ? scope.row.users.length : 0 }}
              </template>

              <!-- 自定义状态列的渲染 -->
              <template #default="scope" v-else-if="col.prop === 'status'">
                <el-tag :type="scope.row.status === 1 ? 'primary' : 'warning'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>

              <!-- 自定义操作列的渲染 -->
              <template #default="scope" v-else-if="col.prop === 'operation'">
                <div class="operation-column-container">
                  <ArtButtonTable type="edit" @click="showDialog('edit', scope.row)" />
                  <ArtButtonTable type="delete" @click="deleteDepartment(scope.row.id)" />
                </div>
              </template>
            </el-table-column>
          </template>
        </ArtTable>
      </ElCard>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
      width="600px"
      align-center
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="85px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="formData.sort"
                style="width: 100%"
                :min="1"
                controls-position="right"
                placeholder="请输入排序号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用" prop="status">
              <el-switch v-model="formData.status" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </ArtTableFullScreen>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getDepartmentList,
    addDepartment,
    updateDepartment,
    deleteDepartment as apiDeleteDepartment
  } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'
  import { useCheckedColumns } from '@/composables/useCheckedColumns'
  import { SearchFormItem } from '@/types/search-form'

  // 状态变量
  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const currentId = ref<number | null>(null)
  const tableData = ref<any[]>([])

  // 表单数据
  const formData = reactive({
    name: '',
    sort: '1',
    status: true
  })

  // 分页配置
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 搜索表单
  const searchForm = reactive({
    name: '',
    status: null as null | number
  })

  // 搜索表单配置项
  const searchItems: SearchFormItem[] = [
    {
      label: '部门名称',
      prop: 'name',
      type: 'input',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请输入部门名称'
      }
    },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请选择状态'
      },
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 }
      ]
    }
  ]

  // 列配置选项
  const columnOptions = [
    { label: '名称', prop: 'name' },
    { label: '排序', prop: 'sort' },
    { label: '人数', prop: 'users' },
    { label: '状态', prop: 'status' },
    { label: '操作', prop: 'operation' }
  ]

  // 动态列配置
  const { columnChecks, columns } = useCheckedColumns(() => [
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
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      align: 'center'
    },
    {
      prop: 'operation',
      label: '操作',
      align: 'center'
    }
  ])

  // 根据列选中状态筛选得到最终显示的列
  const filteredColumns = computed(() => {
    return columns.value
  })

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

  // 表单实例引用
  const formRef = ref<FormInstance>()
  const searchFormRef = ref<FormInstance>()

  // 在组件挂载时获取部门列表
  onMounted(async () => {
    await refreshDepartmentList()
  })

  // 刷新表格数据
  const handleRefresh = () => {
    tableData.value = []
    loading.value = true
    refreshDepartmentList()
  }

  // 刷新部门列表
  const refreshDepartmentList = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      const res = await getDepartmentList(params)
      if (res.code === ApiStatus.success) {
        tableData.value = res.data || []
        
        // 使用返回值中的count字段作为总数
        if (res.count !== undefined) {
          pagination.total = res.count
        } else if (res.meta && res.meta.count) {
          pagination.total = res.meta.count
        } else if (res.meta && res.meta.total) {
          pagination.total = res.meta.total
        } else {
          pagination.total = res.data?.length || 0
        }
      } else {
        ElMessage.error(`获取部门列表失败: ${res.message}`)
      }
    } catch (err) {
      console.error('获取部门列表出错:', err)
      ElMessage.error('获取部门列表失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }

  // 搜索部门
  const search = () => {
    pagination.currentPage = 1
    // refreshDepartmentList 后有 filteredData 计算属性处理搜索，无需额外操作
  }

  // 重置搜索条件并刷新列表
  const resetSearch = () => {
    searchForm.name = ''
    searchForm.status = null
    pagination.currentPage = 1
    refreshDepartmentList()
  }

  // 重置表单
  const resetForm = () => {
    formData.name = ''
    formData.sort = '1'
    formData.status = true
    currentId.value = null
  }

  // 显示对话框
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
          const res = await apiDeleteDepartment(id)
          if (res.code === ApiStatus.success) {
            ElMessage.success('删除部门成功')
            await refreshDepartmentList()
          } else {
            ElMessage.error(`删除部门失败: ${res.message}`)
          }
        } catch (err) {
          console.error('删除部门出错:', err)
          ElMessage.error('删除部门失败')
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        // 用户取消删除，不做任何操作
      })
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
            // 编辑部门
            if (!currentId.value) {
              ElMessage.error('部门ID无效')
              return
            }

            const res = await updateDepartment({
              ...params,
              id: currentId.value
            })

            if (res.code === ApiStatus.success) {
              ElMessage.success('修改部门成功')
              dialogVisible.value = false
              await refreshDepartmentList()
            } else {
              ElMessage.error(`修改部门失败: ${res.message}`)
            }
          } else {
            // 添加部门
            const res = await addDepartment(params)

            if (res.code === ApiStatus.success) {
              ElMessage.success('添加部门成功')
              dialogVisible.value = false
              await refreshDepartmentList()
            } else {
              ElMessage.error(`添加部门失败: ${res.message}`)
            }
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

  // 页码变化处理
  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
  }

  // 每页条数变化处理
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
  }

  // 使用计算属性处理筛选和分页
  const filteredData = computed(() => {
    let result = [...tableData.value]

    // 根据搜索条件筛选数据
    if (searchForm.name) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.status !== null) {
      result = result.filter((item) => item.status === searchForm.status)
    }

    // 计算总数
    pagination.total = result.length

    // 处理分页
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return result.slice(start, end)
  })
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
      justify-content: center;
      align-items: center;
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
