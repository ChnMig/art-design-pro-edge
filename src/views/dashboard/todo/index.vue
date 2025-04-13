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
            <form-input label="任务名称" prop="name" v-model="searchForm.name" />
            <el-col :span="8">
              <el-form-item label="负责人" prop="assignee">
                <el-select
                  v-model="searchForm.assignee"
                  placeholder="请选择负责人"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="任务状态" prop="status">
                <el-select
                  v-model="searchForm.status"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in statusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="创建时间" prop="createTime">
                <el-date-picker
                  v-model="searchForm.createTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="截止时间" prop="dueTime">
                <el-date-picker
                  v-model="searchForm.dueTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')" v-ripple>添加任务</el-button>
      </template>
    </table-bar>

    <el-config-provider :locale="zhCn">
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
            label="任务名称"
            prop="name"
            min-width="150"
            align="center"
            v-if="columns[0].show"
          />
          <el-table-column
            label="负责人"
            prop="assigneeName"
            width="120"
            align="center"
            v-if="columns[1].show"
          />
          <el-table-column
            label="创建时间"
            prop="createTime"
            width="180"
            align="center"
            v-if="columns[2].show"
          >
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="截止时间"
            prop="dueTime"
            width="180"
            align="center"
            v-if="columns[3].show"
          >
            <template #default="scope">
              {{ formatDate(scope.row.dueTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="任务状态"
            prop="status"
            width="120"
            align="center"
            v-if="columns[4].show"
          >
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="优先级"
            prop="priority"
            width="100"
            align="center"
            v-if="columns[5].show"
          >
            <template #default="scope">
              <el-tag :type="getPriorityType(scope.row.priority)" effect="dark">
                {{ getPriorityLabel(scope.row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="描述"
            prop="description"
            min-width="200"
            align="center"
            v-if="columns[6].show"
          >
            <template #default="scope">
              <el-tooltip
                :content="scope.row.description"
                placement="top"
                :hide-after="0"
                v-if="scope.row.description"
              >
                <span
                  >{{ scope.row.description.slice(0, 20)
                  }}{{ scope.row.description.length > 20 ? '...' : '' }}</span
                >
              </el-tooltip>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <button-table type="edit" @click="showDialog('edit', scope.row)" />
              <button-table type="delete" @click="handleDeleteTodo(scope.row)" />
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-config-provider>

    <!-- 使用引入的TodoInfo组件 -->
    <todo-info
      v-model:dialogVisible="dialogVisible"
      :dialogType="dialogType"
      :formData="formData"
      :userList="userList"
      :statusOptions="statusOptions"
      :priorityOptions="priorityOptions"
      @submit="handleSubmit"
      @cancel="dialogVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import { FormInstance } from 'element-plus'
  import { ElMessageBox, ElMessage, ElConfigProvider } from 'element-plus'
  import { ApiStatus } from '@/api/status'
  // 导入TODO相关API
  import { getTodoList, addTodo, updateTodo, deleteTodo, getUserList } from '@/api/system/api'
  // 导入TodoInfo组件
  import TodoInfo from './modal/todoInfo.vue'

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const tableData = ref([])
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 状态选项
  const statusOptions = [
    { value: 1, label: '待处理' },
    { value: 2, label: '进行中' },
    { value: 3, label: '已完成' },
    { value: 4, label: '已取消' }
  ]

  // 优先级选项
  const priorityOptions = [
    { value: 1, label: '低' },
    { value: 2, label: '中' },
    { value: 3, label: '高' },
    { value: 4, label: '紧急' }
  ]

  // 表单数据
  const formData = reactive({
    id: '',
    name: '',
    assignee: undefined,
    status: 1,
    createTime: '',
    dueTime: '',
    priority: 2,
    description: ''
  })

  // 用户列表（负责人）
  const userList = ref([])

  const columns = reactive([
    { name: '任务名称', show: true },
    { name: '负责人', show: true },
    { name: '创建时间', show: true },
    { name: '截止时间', show: true },
    { name: '任务状态', show: true },
    { name: '优先级', show: true },
    { name: '描述', show: true }
  ])

  const searchFormRef = ref<FormInstance>()
  const searchForm = reactive({
    name: '',
    assignee: undefined,
    status: undefined,
    createTime: [],
    dueTime: []
  })

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    // 重置后重新加载数据
    pagination.currentPage = 1
    loadTodoList()
  }

  // 加载TODO列表数据
  const loadTodoList = async () => {
    try {
      // 构建搜索参数，过滤掉undefined和空字符串
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      }

      // 只添加有值的搜索条件
      if (searchForm.name) params.name = searchForm.name
      if (searchForm.assignee) params.assignee = searchForm.assignee
      if (searchForm.status) params.status = searchForm.status
      if (searchForm.createTime && searchForm.createTime.length === 2) {
        params.createTimeStart = searchForm.createTime[0]
        params.createTimeEnd = searchForm.createTime[1]
      }
      if (searchForm.dueTime && searchForm.dueTime.length === 2) {
        params.dueTimeStart = searchForm.dueTime[0]
        params.dueTimeEnd = searchForm.dueTime[1]
      }

      // 调用API获取待办事项列表
      const res = await getTodoList(params)

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
        ElMessage.error(res.message || '获取任务列表失败')
      }
    } catch (error) {
      console.error('获取任务列表出错:', error)
      ElMessage.error('获取任务列表失败')
    }
  }

  // 加载用户列表（负责人选项）
  const loadUserList = async () => {
    try {
      // 调用API获取用户列表
      const res = await getUserList({})

      if (res.code === ApiStatus.success) {
        userList.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表出错:', error)
      ElMessage.error('获取用户列表失败')
    }
  }

  // 初始化加载数据
  onMounted(() => {
    loadTodoList()
    loadUserList()
  })

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '--'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 页码变化
  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadTodoList()
  }

  // 每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadTodoList()
  }

  // TodoInfo组件引用
  const todoInfoRef = ref(null)

  // 显示添加/编辑对话框
  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      // 编辑模式，填充表单数据
      formData.id = row.id
      formData.name = row.name
      formData.assignee = row.assignee
      formData.status = row.status
      formData.dueTime = row.dueTime ? new Date(row.dueTime) : ''
      formData.priority = row.priority
      formData.description = row.description
    } else {
      // 添加模式，重置表单
      formData.id = ''
      formData.name = ''
      formData.assignee = undefined
      formData.status = 1
      formData.dueTime = ''
      formData.priority = 2
      formData.description = ''
    }
  }

  // 删除任务
  const handleDeleteTodo = (row: any) => {
    ElMessageBox.confirm('确定要删除该任务吗？', '删除任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        try {
          // 调用API删除任务
          const res = await deleteTodo(row.id)

          if (res.code === ApiStatus.success) {
            ElMessage.success('删除任务成功')
            loadTodoList()
          } else {
            ElMessage.error(res.message || '删除任务失败')
          }
        } catch (error) {
          console.error('删除任务出错:', error)
          ElMessage.error('删除任务失败，请稍后重试')
        }
      })
      .catch(() => {
        // 用户取消删除，不做处理
      })
  }

  // 执行搜索
  const search = () => {
    pagination.currentPage = 1
    loadTodoList()
  }

  // 改变列显示
  const changeColumn = (list: any) => {
    columns.values = list
  }

  // 获取状态标签类型
  const getTagType = (status: number) => {
    switch (status) {
      case 1:
        return 'info' // 待处理
      case 2:
        return 'warning' // 进行中
      case 3:
        return 'success' // 已完成
      case 4:
        return 'danger' // 已取消
      default:
        return 'info'
    }
  }

  // 获取状态标签文本
  const getStatusLabel = (status: number) => {
    const option = statusOptions.find((item) => item.value === status)
    return option ? option.label : '--'
  }

  // 获取优先级标签类型
  const getPriorityType = (priority: number) => {
    switch (priority) {
      case 1:
        return 'info' // 低
      case 2:
        return 'success' // 中
      case 3:
        return 'warning' // 高
      case 4:
        return 'danger' // 紧急
      default:
        return 'info'
    }
  }

  // 获取优先级标签文本
  const getPriorityLabel = (priority: number) => {
    const option = priorityOptions.find((item) => item.value === priority)
    return option ? option.label : '--'
  }

  // 处理表单提交
  const handleSubmit = async (submitData) => {
    try {
      // 调用添加或更新任务的API
      const res =
        dialogType.value === 'add' ? await addTodo(submitData) : await updateTodo(submitData)

      if (res.code === ApiStatus.success) {
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
        dialogVisible.value = false
        loadTodoList()
      } else {
        ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
      }
    } catch (error) {
      console.error('提交表单出错:', error)
      ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
    }
  }
</script>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;
  }
</style>
