<template>
  <ArtTableFullScreen>
    <div class="user-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="searchState"
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
            <ElButton @click="showDialog('add')" v-ripple>添加用户</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :data="tableData"
          :columns="columns"
          :pagination="paginationState"
          :loading="isLoading"
          :table-config="{ rowKey: 'User.id' }"
          :layout="{ marginTop: 10 }"
          @pagination:size-change="onPageSizeChange"
          @pagination:current-change="onCurrentPageChange"
        />
      </ElCard>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="600px"
      align-center
      :close-on-click-modal="false"
    >
      <ElForm ref="formRef" :model="formData" :rules="computedRules" label-width="85px">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="账号" prop="username">
              <ElInput
                v-model="formData.username"
                :disabled="dialogType === 'edit'"
                placeholder="请输入账号"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="用户名" prop="name">
              <ElInput v-model="formData.name" placeholder="请输入用户名" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="密码" prop="password">
              <ElInput
                v-model="formData.password"
                type="password"
                show-password
                :placeholder="dialogType === 'add' ? '请输入密码' : '不填则不修改密码'"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="手机号" prop="phone">
              <ElInput v-model="formData.phone" placeholder="请输入手机号" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="性别" prop="gender">
              <ElSelect v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
                <ElOption label="请选择" :value="undefined" disabled></ElOption>
                <ElOption label="男" :value="1" />
                <ElOption label="女" :value="2" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="部门" prop="department_id">
              <ElSelect
                v-model="formData.department_id"
                placeholder="请选择部门"
                style="width: 100%"
              >
                <ElOption label="请选择" :value="undefined" disabled></ElOption>
                <ElOption
                  v-for="item in departmentList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 1"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="角色" prop="role_id">
              <ElSelect v-model="formData.role_id" placeholder="请选择角色" style="width: 100%">
                <ElOption label="请选择" :value="undefined" disabled></ElOption>
                <ElOption
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 1"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="启用">
              <ElSwitch v-model="formData.status" :active-value="1" :inactive-value="2" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取 消</ElButton>
          <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
        </div>
      </template>
    </ElDialog>
  </ArtTableFullScreen>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed, h, resolveComponent, onMounted } from 'vue'
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser as apiDeleteUser,
  getDepartmentList,
  getRoleList
} from '@/api/system/api'
import { FormInstance } from 'element-plus'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'
import { ApiStatus } from '@/utils/http/status'
import { useTable } from '@/composables/useTable'
import { SearchFormItem } from '@/types'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  // 状态变量
  const dialogType = ref('add')
  const dialogVisible = ref(false)
  // useTable 适配
  const tableApi = useTable<any>({
    core: {
      apiFn: getUserList,
      apiParams: {
        page: 1,
        pageSize: 10,
        name: '',
        username: '',
        phone: '',
        department_id: undefined,
        role_id: undefined
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'User.name',
          label: '用户名',
          align: 'center',
          formatter: (row: any) => row.User?.name || '--'
        },
        {
          prop: 'User.username',
          label: '账号',
          align: 'center',
          formatter: (row: any) => row.User?.username || '--'
        },
        {
          prop: 'User.phone',
          label: '手机号',
          align: 'center',
          formatter: (row: any) => row.User?.phone || '--'
        },
        {
          prop: 'User.gender',
          label: '性别',
          align: 'center',
          formatter: (row: any) => {
            if (row.User?.gender === 1) return h(resolveComponent('ElTag'), { type: 'success', effect: 'light' }, { default: () => '男' })
            if (row.User?.gender === 2) return h(resolveComponent('ElTag'), { type: 'danger', effect: 'light' }, { default: () => '女' })
            return '--'
          }
        },
        {
          prop: 'department_name',
          label: '部门',
          align: 'center'
        },
        {
          prop: 'role_name',
          label: '角色',
          align: 'center'
        },
        {
          prop: 'User.status',
          label: '状态',
          align: 'center',
          formatter: (row: any) => h(resolveComponent('ElTag'), { type: getTagType(row.User?.status) }, { default: () => buildTagText(row.User?.status) })
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
                onClick: () => handleDeleteUser(row)
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

  // 添加部门列表和角色列表的响应式数据
  const departmentList = ref<any[]>([])
  const roleList = ref<any[]>([])

  // 用户表单数据
  const formData = reactive({
    id: '',
    username: '',
    name: '',
    password: '',
    phone: '',
    gender: undefined,
    status: 1,
    department_id: undefined,
    role_id: undefined
  })

  // 搜索表单
  const searchForm = reactive({
    name: '',
    username: '',
    phone: '',
    department_id: undefined as undefined | number,
    role_id: undefined as undefined | number
  })

  // 搜索表单配置项
  const searchItems: SearchFormItem[] = [
    {
      label: '用户名',
      prop: 'name',
      type: 'input',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请输入用户名'
      }
    },
    {
      label: '账号',
      prop: 'username',
      type: 'input',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请输入账号'
      }
    },
    {
      label: '手机号',
      prop: 'phone',
      type: 'input',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请输入手机号'
      }
    },
    {
      label: '部门',
      prop: 'department_id',
      type: 'select',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请选择部门'
      },
      options: () =>
        departmentList.value.map((item) => ({
          label: item.name,
          value: item.id
        }))
    },
    {
      label: '角色',
      prop: 'role_id',
      type: 'select',
      elColSpan: 6, // 从8改为6，缩短显示宽度
      config: {
        clearable: true,
        placeholder: '请选择角色'
      },
      options: () =>
        roleList.value.map((item) => ({
          label: item.name,
          value: item.id
        }))
    }
  ]

  // 列配置选项
  const columnOptions = [
    { label: '用户名', prop: 'User.name' },
    { label: '账号', prop: 'User.username' },
    { label: '手机号', prop: 'User.phone' },
    { label: '性别', prop: 'User.gender' },
    { label: '部门', prop: 'department_name' },
    { label: '角色', prop: 'role_name' },
    { label: '状态', prop: 'User.status' },
    { label: '操作', prop: 'operation' }
  ]

  // 已由 useTable 管理

  // 表单实例引用
  const formRef = ref<FormInstance>()
  const searchFormRef = ref<FormInstance>()

  // 刷新表格数据
  const handleRefresh = () => {
    refreshAll()
  }

  // 用户列表数据已由 useTable 管理

  // 加载部门列表数据
  const loadDepartmentList = async () => {
    try {
      const res = await getDepartmentList()
      if (res.code === ApiStatus.success) {
        departmentList.value = res.data?.data || res.data || []
      } else {
        ElMessage.error(res.message || '获取部门列表失败')
      }
    } catch (err) {
      console.error('获取部门列表出错:', err)
      ElMessage.error('获取部门列表失败')
    }
  }

  // 加载角色列表数据
  const loadRoleList = async () => {
    try {
      const res = await getRoleList()
      if (res.code === ApiStatus.success) {
        roleList.value = res.data?.data || res.data || []
      } else {
        ElMessage.error(res.message || '获取角色列表失败')
      }
    } catch (err) {
      console.error('获取角色列表出错:', err)
      ElMessage.error('获取角色列表失败')
    }
  }

  // 分页、搜索、重置逻辑已由 useTable 管理

  // 显示对话框
  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      formData.id = row.User.id
      formData.username = row.User.username || ''
      formData.name = row.User.name
      formData.phone = row.User.phone || ''
      formData.gender = row.User.gender === 0 ? 1 : row.User.gender // 如果性别是未知(0)，则默认设为男(1)
      formData.status = row.User.status
      formData.department_id = row.User.department_id
      formData.role_id = row.User.role_id || 1 // 获取角色ID，如果没有则默认为1
      formData.password = '' // 编辑模式下明确清空密码
    } else {
      // 添加用户时重置表单并确保状态为启用
      formData.id = ''
      formData.username = ''
      formData.name = ''
      formData.password = ''
      formData.phone = ''
      formData.gender = undefined
      formData.status = 1
      formData.department_id = undefined
      formData.role_id = undefined

      // 确保下一个渲染周期状态为启用
      nextTick(() => {
        formData.status = 1
      })
    }

    // 强制重新计算验证规则
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    })
  }

  // 处理删除用户
  const handleDeleteUser = (row: any) => {
    ElMessageBox.confirm('确定要删除该用户吗？', '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        try {
          // 确保用户ID正确传递
          const userId = row.User?.id
          if (!userId) {
            ElMessage.error('用户ID无效')
            return
          }

          const res = await apiDeleteUser(userId)
          if (res.code === 200) {
            ElMessage.success('删除用户成功')
            refreshAll()
          } else {
            ElMessage.error(res.message || '删除用户失败')
          }
        } catch (err) {
          console.error('删除用户出错:', err)
          ElMessage.error('删除用户失败，请稍后重试')
        }
      })
      .catch(() => {
        // 用户取消删除，不做处理
      })
  }

  const getTagType = (status: number) => {
    switch (status) {
      case 1:
        return 'primary'
      case 2:
        return 'warning'
      default:
        return 'info'
    }
  }

  const buildTagText = (status: number) => {
    if (status === 1) {
      return '启用'
    } else if (status === 2) {
      return '禁用'
    } else {
      return '未知'
    }
  }

  // 定义基本验证规则
  const baseRules = {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    department_id: [{ required: true, message: '请选择部门', trigger: 'change' }],
    role_id: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  // 根据对话框类型动态计算验证规则
  const computedRules = computed(() => {
    // 添加模式下的规则
    if (dialogType.value === 'add') {
      return {
        ...baseRules,
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
    // 编辑模式下的规则
    else {
      return {
        ...baseRules,
        password: [
          { required: false },
          {
            validator: (rule: any, value: any, callback: any) => {
              if (!value || value === '') {
                callback()
              } else if (value.length < 6 || value.length > 20) {
                callback(new Error('长度在 6 到 20 个字符'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  })

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const submitData = { ...formData }

          // 如果是编辑模式且密码为空，则删除密码字段
          if (dialogType.value === 'edit' && !submitData.password) {
            ;(submitData as any).password = undefined
          }

          let res
          if (dialogType.value === 'add') {
            res = await addUser(submitData)
          } else {
            res = await updateUser(submitData)
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            refreshAll()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (err) {
          console.error('提交表单出错:', err)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        }
      }
    })
  }

  // 初始化加载部门和角色数据
onMounted(async () => {
    await Promise.all([loadDepartmentList(), loadRoleList()])
  })
</script>

<style lang="scss" scoped>
  .user-page {
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

    .user {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }

  .status-hint {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
