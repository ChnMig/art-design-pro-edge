<template>
  <ArtTableFullScreen>
    <div class="role-page" id="table-full-screen">
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
            <ElButton @click="showDialog('add')" v-ripple>添加角色</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :data="tableData"
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
              <!-- 自定义状态列的渲染 -->
              <template #default="scope" v-if="col.prop === 'status'">
                <el-tag :type="scope.row.status === 1 ? 'primary' : 'warning'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>

              <!-- 自定义用户数量列的渲染 -->
              <template #default="scope" v-else-if="col.prop === 'users'">
                {{ scope.row.users ? scope.row.users.length : 0 }}
              </template>

              <!-- 自定义操作列的渲染 -->
              <template #default="scope" v-else-if="col.prop === 'operation'">
                <div class="operation-column-container">
                  <ArtButtonMore
                    :list="actionButtons"
                    @click="buttonMoreClick($event, scope.row)"
                  />
                </div>
              </template>
            </el-table-column>
          </template>
        </ArtTable>
      </ElCard>

      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
        width="500px"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="描述" prop="desc">
            <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请输入角色描述" />
          </el-form-item>
          <el-form-item label="启用">
            <el-switch v-model="form.status" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit(formRef)" :loading="submitLoading"
              >提交</el-button
            >
          </div>
        </template>
      </el-dialog>

      <role-auth
        v-model:visible="permissionDrawer"
        :role-id="currentRoleId"
        @saved="handlePermissionSaved"
      />
    </div>
  </ArtTableFullScreen>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue'
  import { ButtonMoreItem } from '@/components/core/forms/ArtButtonMore.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getRoleList, addRole, updateRole, deleteRole } from '@/api/system/api'
  import RoleAuth from './auth.vue'
  import { useCheckedColumns } from '@/composables/useCheckedColumns'
  import { SearchFormItem } from '@/types/search-form'

  // 状态变量
  const dialogVisible = ref(false)
  const permissionDrawer = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const currentRoleId = ref<number | undefined>(undefined)
  const formRef = ref<FormInstance>()
  const dialogType = ref('add')
  const tableData = ref<any[]>([])

  // 分页配置
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 搜索表单
  const searchForm = reactive({
    name: '',
    status: undefined as undefined | number
  })

  // 搜索表单配置项
  const searchItems: SearchFormItem[] = [
    {
      label: '角色名称',
      prop: 'name',
      type: 'input',
      config: {
        clearable: true,
        placeholder: '请输入角色名称'
      }
    },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
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
    { label: '角色名称', prop: 'name' },
    { label: '描述', prop: 'desc' },
    { label: '状态', prop: 'status' },
    { label: '用户数量', prop: 'users' },
    { label: '操作', prop: 'operation' }
  ]

  // 动态列配置
  const { columnChecks, columns } = useCheckedColumns(() => [
    {
      prop: 'name',
      label: '角色名称',
      align: 'center'
    },
    {
      prop: 'desc',
      label: '描述',
      showOverflowTooltip: true,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      align: 'center'
    },
    {
      prop: 'users',
      label: '用户数量',
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
    return columns.value.map((col) => {
      // 不再强制设置操作列固定
      return col
    })
  })

  // 表单验证规则
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    desc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  // 表单数据
  const form = reactive({
    id: '',
    name: '',
    desc: '',
    status: true
  })

  // 操作按钮列表
  const actionButtons = [
    { key: 'permission', label: '菜单权限' },
    { key: 'edit', label: '编辑角色' },
    { key: 'delete', label: '删除角色' }
  ]

  // 获取角色列表
  const fetchRoleList = async () => {
    loading.value = true
    try {
      // 调用 API 获取角色列表数据
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      const response = await getRoleList(params)

      if (response.code === 200) {
        // 处理响应数据
        tableData.value = response.data || []
        
        // 使用返回值中的count字段作为总数
        if (response.count !== undefined) {
          pagination.total = response.count
        } else if (response.meta && response.meta.count) {
          pagination.total = response.meta.count
        } else if (response.meta && response.meta.total) {
          pagination.total = response.meta.total
        } else {
          pagination.total = tableData.value.length
        }
      } else {
        ElMessage.error(response.message || '获取角色列表失败')
      }
    } catch (err) {
      console.error('获取角色列表出错:', err)
      ElMessage.error('获取角色列表失败，请稍后再试')
    } finally {
      loading.value = false
    }
  }

  // 刷新表格数据
  const handleRefresh = () => {
    tableData.value = []
    loading.value = true
    fetchRoleList()
  }

  // 页码变化处理
  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    fetchRoleList()
  }

  // 每页条数变化处理
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    fetchRoleList()
  }

  // 搜索处理
  const search = () => {
    pagination.currentPage = 1
    fetchRoleList()
  }

  // 重置搜索
  const resetSearch = () => {
    searchForm.name = ''
    searchForm.status = undefined
    pagination.currentPage = 1
    fetchRoleList()
  }

  // 初始化
  onMounted(() => {
    fetchRoleList()
  })

  // 显示对话框
  const showDialog = (type: string, row?: any) => {
    dialogType.value = type
    dialogVisible.value = true

    // 表单重置
    nextTick(() => {
      formRef.value?.resetFields()

      if (type === 'edit' && row) {
        form.id = row.id
        form.name = row.name
        form.desc = row.desc
        form.status = row.status === 1
      } else {
        form.id = ''
        form.name = ''
        form.desc = ''
        form.status = true
      }
    })
  }

  // 处理按钮点击
  const buttonMoreClick = (item: ButtonMoreItem, row: any) => {
    switch (item.key) {
      case 'permission':
        showPermissionDrawer(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteRoleAction(row.id)
        break
    }
  }

  // 显示权限抽屉
  const showPermissionDrawer = (row: any) => {
    currentRoleId.value = row.id
    permissionDrawer.value = true
  }

  // 权限保存后的处理
  const handlePermissionSaved = () => {
    ElMessage.success('权限设置已保存')
    fetchRoleList()
  }

  // 删除角色
  const deleteRoleAction = (id: number) => {
    ElMessageBox.confirm('确定删除该角色吗？删除后无法恢复！', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const response = await deleteRole(id)
          if (response.code === 200) {
            ElMessage.success('删除成功')
            fetchRoleList()
          } else {
            ElMessage.error(response.message || '删除失败')
          }
        } catch (err) {
          console.error('删除角色出错:', err)
          ElMessage.error('删除失败，请稍后再试')
        }
      })
      .catch(() => {})
  }

  // 提交表单
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true

        try {
          const roleData = {
            name: form.name,
            desc: form.desc,
            status: form.status ? 1 : 2
          }

          const response =
            dialogType.value === 'add'
              ? await addRole(roleData)
              : await updateRole({ id: form.id, ...roleData })

          if (response.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
            dialogVisible.value = false
            fetchRoleList()
          } else {
            ElMessage.error(response.message || '操作失败')
          }
        } catch (err) {
          console.error('提交表单出错:', err)
          ElMessage.error('操作失败，请稍后再试')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .role-page {
    // 添加表格容器样式
    .table-container {
      flex: 1;
      min-height: 0; // 重要：允许容器收缩
      padding: 16px; // 根据需求调整内边距
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

    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      vertical-align: -8px;
      fill: currentcolor;
    }

    .operation-column-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
