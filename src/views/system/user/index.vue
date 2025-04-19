<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="用户名" prop="name" v-model="searchForm.name" />
            <form-input label="账号" prop="username" v-model="searchForm.username" />
            <form-input label="手机号" prop="phone" v-model="searchForm.phone" />
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="部门" prop="department_id">
                <el-select
                  v-model="searchForm.department_id"
                  placeholder="请选择部门"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in departmentList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="角色" prop="role_id">
                <el-select
                  v-model="searchForm.role_id"
                  placeholder="请选择角色"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in roleList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')" v-ripple>添加用户</el-button>
      </template>
    </table-bar>

    <el-config-provider>
      <art-table
        :data="tableData"
        :currentPage="pagination.currentPage"
        :pageSize="pagination.pageSize"
        :total="pagination.total"
        :hideOnSinglePage="false"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      >
        <template #default>
          <el-table-column
            label="用户名"
            prop="User.name"
            width="200px"
            align="center"
            v-if="columns[0].show"
          >
            <template #default="scope">
              {{ scope.row.User?.name || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            label="账号"
            prop="User.username"
            align="center"
            v-if="columns[5].show"
          >
            <template #default="scope">
              {{ scope.row.User?.username || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="手机号" align="center" v-if="columns[1].show">
            <template #default="scope">
              {{ scope.row.User?.phone || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="性别" align="center" v-if="columns[2].show">
            <template #default="scope">
              <el-tag v-if="scope.row.User?.gender === 1" type="success" effect="light">男</el-tag>
              <el-tag v-else-if="scope.row.User?.gender === 2" type="danger" effect="light"
                >女</el-tag
              >
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column
            label="部门"
            prop="department_name"
            align="center"
            v-if="columns[3].show"
          />
          <el-table-column label="角色" prop="role_name" align="center" v-if="columns[6].show" />
          <el-table-column label="状态" prop="User.status" align="center" v-if="columns[4].show">
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.User?.status)">
                {{ buildTagText(scope.row.User?.status) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150px" align="center">
            <template #default="scope">
              <ArtButtonTable type="edit" @click="showDialog('edit', scope.row)" />
              <ArtButtonTable type="delete" @click="handleDeleteUser(scope.row)" />
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-config-provider>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="600px"
      align-center
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="computedRules" label-width="85px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号" prop="username">
              <el-input
                v-model="formData.username"
                :disabled="dialogType === 'edit'"
                placeholder="请输入账号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                show-password
                :placeholder="dialogType === 'add' ? '请输入密码' : '不填则不修改密码'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="请选择" :value="undefined" disabled></el-option>
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department_id">
              <el-select
                v-model="formData.department_id"
                placeholder="请选择部门"
                style="width: 100%"
              >
                <el-option label="请选择" :value="undefined" disabled></el-option>
                <el-option
                  v-for="item in departmentList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role_id">
              <el-select v-model="formData.role_id" placeholder="请选择角色" style="width: 100%">
                <el-option label="请选择" :value="undefined" disabled></el-option>
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.status !== 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import {
    getUserList,
    addUser,
    updateUser,
    deleteUser as apiDeleteUser, // 重命名导入的API函数
    getDepartmentList,
    getRoleList
  } from '@/api/system/api'
  import { FormInstance } from 'element-plus'
  import { ElMessageBox, ElMessage, ElConfigProvider } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import { onMounted, nextTick, computed } from 'vue'
  import { ApiStatus } from '@/api/status'

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const tableData = ref([])
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  const formData = reactive({
    id: '',
    username: '',
    name: '',
    password: '',
    phone: '',
    gender: undefined, // 将默认值改为 undefined
    status: 1, // 默认启用状态
    department_id: undefined, // 将默认值改为 undefined
    role_id: undefined // 将默认值改为 undefined
  })

  const genderOptions = [
    {
      value: 1,
      label: '男'
    },
    {
      value: 2,
      label: '女'
    }
  ]

  const roleOptions = [
    {
      value: 1,
      label: '管理员'
    },
    {
      value: 2,
      label: '普通员工'
    },
    {
      value: 3,
      label: '访客'
    }
  ]

  const columns = reactive([
    { name: '用户名', show: true },
    { name: '手机号', show: true },
    { name: '性别', show: true },
    { name: '部门', show: true },
    { name: '状态', show: true },
    { name: '账号', show: true },
    { name: '角色', show: true }
  ])

  const searchFormRef = ref<FormInstance>()
  const searchForm = reactive({
    name: '',
    username: '', // 改为username以匹配API参数
    phone: '',
    department_id: undefined, // 添加部门ID搜索条件
    role_id: undefined // 添加角色ID搜索条件
  })

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    // 重置后重新加载数据
    pagination.currentPage = 1
    loadUserList()
  }

  // 添加部门列表和角色列表的响应式数据
  const departmentList = ref<any[]>([])
  const roleList = ref<any[]>([])

  // 加载用户列表数据 - 添加搜索参数
  const loadUserList = async () => {
    try {
      // 构建搜索参数，过滤掉undefined和空字符串
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      }

      // 只添加有值的搜索条件
      if (searchForm.name) params.name = searchForm.name
      if (searchForm.username) params.username = searchForm.username
      if (searchForm.phone) params.phone = searchForm.phone
      if (searchForm.department_id) params.department_id = searchForm.department_id
      if (searchForm.role_id) params.role_id = searchForm.role_id

      const res = await getUserList(params)
      if (res.code === 200) {
        tableData.value = res.data || []

        // 使用返回值中的count字段作为总数
        if (res.count !== undefined) {
          pagination.total = res.count
        } else if (res.meta && res.meta.count) {
          // 备用：检查meta.count
          pagination.total = res.meta.count
        } else if (res.meta && res.meta.total) {
          // 备用：检查meta.total
          pagination.total = res.meta.total
        } else {
          // 兜底：使用数组长度
          pagination.total = res.data?.length || 0
        }
      } else {
        ElMessage.error(res.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表出错:', error)
      ElMessage.error('获取用户列表失败')
    }
  }

  // 加载部门列表数据
  const loadDepartmentList = async () => {
    try {
      const res = await getDepartmentList()
      if (res.code === ApiStatus.success) {
        departmentList.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取部门列表失败')
      }
    } catch (error) {
      console.error('获取部门列表出错:', error)
      ElMessage.error('获取部门列表失败')
    }
  }

  // 加载角色列表数据
  const loadRoleList = async () => {
    try {
      const res = await getRoleList()
      if (res.code === ApiStatus.success) {
        roleList.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表出错:', error)
      ElMessage.error('获取角色列表失败')
    }
  }

  // 初始化加载数据
  onMounted(async () => {
    // 并行加载所有数据
    await Promise.all([loadUserList(), loadDepartmentList(), loadRoleList()])
  })

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  // 页码变化
  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadUserList()
  }

  // 每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadUserList()
  }

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
      formData.gender = undefined // 默认不选择性别
      formData.status = 1 // 明确设置为启用状态
      formData.department_id = undefined // 默认不选择部门
      formData.role_id = undefined // 默认不选择角色

      // 确保下一个渲染周期状态为启用
      nextTick(() => {
        formData.status = 1
      })
    }

    // 强制重新计算验证规则
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate() // 清除之前的验证结果
      }
    })
  }

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
            // 重新加载用户列表
            loadUserList()
          } else {
            ElMessage.error(res.message || '删除用户失败')
          }
        } catch (error) {
          console.error('删除用户出错:', error)
          ElMessage.error('删除用户失败，请稍后重试')
        }
      })
      .catch(() => {
        // 用户取消删除，不做处理
      })
  }

  const search = () => {
    pagination.currentPage = 1
    loadUserList()
  }

  const changeColumn = (list: any) => {
    columns.values = list
  }

  const filterTag = (value: number, row: any) => {
    return row.status === value
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
          { required: false }, // 明确设置为不必填
          {
            validator: (rule, value, callback) => {
              if (!value || value === '') {
                callback() // 空密码直接通过
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

  const formRef = ref<FormInstance>()

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 准备提交的数据
          const submitData = {
            ...formData
          }

          // 如果是编辑模式且密码为空，则删除密码字段
          if (dialogType.value === 'edit' && !submitData.password) {
            delete submitData.password
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
            loadUserList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error('提交表单出错:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        }
      }
    })
  }

  // 初始化加载数据
  onMounted(() => {
    loadUserList()
  })
</script>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;

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
