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
            <form-input label="手机号" prop="phone" v-model="searchForm.phone" />
            <form-input label="邮箱" prop="email" v-model="searchForm.email" />
            <form-input label="账号" prop="account" v-model="searchForm.account" />
          </el-row>
          <el-row :gutter="20">
            <form-input label="用户ID" prop="id" v-model="searchForm.id" />
            <form-select
              label="性别"
              prop="gender"
              v-model="searchForm.gender"
              :options="genderOptions"
            />
            <form-select
              label="会员等级"
              prop="level"
              v-model="searchForm.level"
              :options="levelOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')" v-ripple>添加用户</el-button>
      </template>
    </table-bar>

    <art-table
      :data="tableData"
      selection
      :currentPage="pagination.currentPage"
      :pageSize="pagination.pageSize"
      :total="pagination.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #default>
        <el-table-column label="用户名" prop="name" width="200px" v-if="columns[0].show" />
        <el-table-column label="手机号" prop="phone" v-if="columns[1].show" />
        <el-table-column
          label="性别"
          prop="gender"
          #default="scope"
          sortable
          v-if="columns[2].show"
        >
          {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
        </el-table-column>
        <el-table-column label="部门" prop="department_id" v-if="columns[3].show" />
        <el-table-column label="状态" prop="status" v-if="columns[4].show">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)">
              {{ buildTagText(scope.row.status) }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="创建日期" prop="created_at" sortable v-if="columns[5].show">
          <template #default="scope">
            {{ formatTimestamp(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150px">
          <template #default="scope">
            <button-table type="edit" @click="showDialog('edit', scope.row)" />
            <button-table type="delete" @click="deleteUser(scope.row)" />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
            <el-option label="未知" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department_id">
          <el-select v-model="formData.department_id">
            <el-option label="董事会部" :value="1" />
            <el-option label="市场部" :value="2" />
            <el-option label="技术部" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { getUserList, addUser, updateUser, deleteUser } from '@/api/system/api'
  import { FormInstance } from 'element-plus'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import { onMounted } from 'vue'

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
    name: '',
    phone: '',
    gender: 0,
    department_id: 1
  })

  const genderOptions = [
    {
      value: 1,
      label: '男'
    },
    {
      value: 2,
      label: '女'
    },
    {
      value: 0,
      label: '未知'
    }
  ]
  const levelOptions = [
    {
      value: '1',
      label: '普通用户'
    },
    {
      value: '2',
      label: ' VIP'
    }
  ]

  const columns = reactive([
    { name: '用户名', show: true },
    { name: '手机号', show: true },
    { name: '性别', show: true },
    { name: '部门', show: true },
    { name: '状态', show: true },
    { name: '创建日期', show: true }
  ])

  const searchFormRef = ref<FormInstance>()
  const searchForm = reactive({
    name: '',
    phone: '',
    email: '',
    account: '',
    id: '',
    gender: 0,
    level: ''
  })

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    // 重置后重新加载数据
    pagination.currentPage = 1
    loadUserList()
  }

  // 加载用户列表数据
  const loadUserList = async () => {
    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      const res = await getUserList(params)
      if (res.code === 200) {
        tableData.value = res.data || []
        pagination.total = res.data?.length || 0 // 使用数组长度作为总数
      } else {
        ElMessage.error(res.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表出错:', error)
      ElMessage.error('获取用户列表失败')
    }
  }

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
      formData.id = row.id
      formData.name = row.name
      formData.phone = row.phone || ''
      formData.gender = row.gender
      formData.department_id = row.department_id
    } else {
      formData.id = ''
      formData.name = ''
      formData.phone = ''
      formData.gender = 0
      formData.department_id = 1
    }
  }

  const deleteUser = (row: any) => {
    ElMessageBox.confirm('确定要注销该用户吗？', '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        const res = await deleteUser(row.id)
        if (res.code === 200) {
          ElMessage.success('注销成功')
          loadUserList()
        } else {
          ElMessage.error(res.message || '注销失败')
        }
      } catch (error) {
        console.error('删除用户出错:', error)
        ElMessage.error('注销失败')
      }
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

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    department_id: [{ required: true, message: '请选择部门', trigger: 'change' }]
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
</style>
