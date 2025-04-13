<template>
  <el-dialog
    :modelValue="dialogVisible"
    @update:modelValue="$emit('update:dialogVisible', $event)"
    :title="dialogType === 'add' ? '添加任务' : '编辑任务'"
    width="600px"
    align-center
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="85px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入任务名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="assignee">
            <el-select
              v-model="formData.assignee"
              placeholder="请选择负责人"
              style="width: 100%"
              filterable
              remote
              reserve-keyword
              :remote-method="remoteSearchUsers"
              :loading="userLoading"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
              <template #dropdown>
                <div class="select-dropdown">
                  <div class="options-container">
                    <!-- 选项已在el-option中渲染 -->
                  </div>
                  <div class="pagination-container" v-if="userTotal > pageSize">
                    <el-pagination
                      small
                      layout="prev, pager, next"
                      :total="userTotal"
                      :current-page="currentPage"
                      :page-size="pageSize"
                      @current-change="handleUserPageChange"
                    />
                  </div>
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div class="status-option">
                  <div class="color-dot" :class="`status-${item.value}`"></div>
                  <span>{{ item.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="截止时间" prop="dueTime">
            <el-date-picker
              v-model="formData.dueTime"
              type="date"
              placeholder="请选择截止日期"
              style="width: 100%"
              :shortcuts="dateShortcuts"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :locale="zhCn"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="item in priorityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div class="priority-option">
                  <div class="color-dot" :class="`priority-${item.value}`"></div>
                  <span>{{ item.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入任务描述"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('cancel')">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, nextTick, PropType, onMounted } from 'vue'
  import { FormInstance } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { getUserCache } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'

  const props = defineProps({
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogType: {
      type: String,
      default: 'add'
    },
    formData: {
      type: Object,
      default: () => ({
        id: '',
        name: '',
        assignee: undefined,
        status: 1,
        createTime: '',
        dueTime: '',
        priority: 2,
        description: ''
      })
    },
    userList: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    statusOptions: {
      type: Array as PropType<any[]>,
      default: () => [
        { value: 1, label: '待处理' },
        { value: 2, label: '进行中' },
        { value: 3, label: '已完成' },
        { value: 4, label: '已取消' }
      ]
    },
    priorityOptions: {
      type: Array as PropType<any[]>,
      default: () => [
        { value: 1, label: '低' },
        { value: 2, label: '中' },
        { value: 3, label: '高' },
        { value: 4, label: '紧急' }
      ]
    }
  })

  const emit = defineEmits(['submit', 'cancel', 'update:dialogVisible'])

  // 用户选择相关状态
  const userOptions = ref<any[]>([])
  const userLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const userTotal = ref(0)
  const searchKeyword = ref('')

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }],
    status: [{ required: true, message: '请选择任务状态', trigger: 'change' }],
    dueTime: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
    priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
  }

  const formRef = ref<FormInstance>()

  // 加载用户列表
  const loadUserOptions = async () => {
    try {
      userLoading.value = true
      const params = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      }
      const res = await getUserCache(params)

      if (res.code === ApiStatus.success) {
        userOptions.value = res.data || []
        userTotal.value = res.count || 0
      } else {
        ElMessage.error(res.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表出错:', error)
      ElMessage.error('获取用户列表失败')
    } finally {
      userLoading.value = false
    }
  }

  // 远程搜索用户
  const remoteSearchUsers = (query: string) => {
    searchKeyword.value = query
    currentPage.value = 1
    loadUserOptions()
  }

  // 处理用户分页
  const handleUserPageChange = (page: number) => {
    currentPage.value = page
    loadUserOptions()
  }

  // 对话框打开时加载用户列表
  onMounted(() => {
    nextTick(() => {
      loadUserOptions()
    })
  })

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 准备提交的数据
          const submitData = {
            ...props.formData,
            // 添加任务时自动设置创建时间
            createTime: props.dialogType === 'add' ? new Date().toISOString() : undefined
          }

          // 提交给父组件处理
          emit('submit', submitData)
        } catch (error) {
          console.error('提交表单出错:', error)
          ElMessage.error(props.dialogType === 'add' ? '添加失败' : '更新失败')
        }
      }
    })
  }

  // 监听对话框关闭
  const handleClose = () => {
    emit('update:dialogVisible', false)
    emit('cancel')
  }

  // 确保表单验证状态在对话框打开后被重置
  defineExpose({
    formRef,
    resetValidation: () => {
      nextTick(() => {
        if (formRef.value) {
          formRef.value.clearValidate()
        }
      })
    }
  })

  // 日期快捷选项
  const dateShortcuts = [
    {
      text: '今天',
      value: () => {
        const end = new Date()
        return end
      }
    },
    {
      text: '明天',
      value: () => {
        const end = new Date()
        end.setDate(end.getDate() + 1)
        return end
      }
    },
    {
      text: '一周后',
      value: () => {
        const end = new Date()
        end.setDate(end.getDate() + 7)
        return end
      }
    }
  ]
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

  .select-dropdown {
    display: flex;
    flex-direction: column;
    width: 100%;

    .options-container {
      flex: 1;
      overflow-y: auto;
    }

    .pagination-container {
      padding: 8px 0;
      display: flex;
      justify-content: center;
      border-top: 1px solid #ebeef5;
    }
  }

  .status-option,
  .priority-option {
    display: flex;
    align-items: center;

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }

    // 任务状态颜色
    .status-1 {
      background-color: #909399;
    } // 待处理：灰色
    .status-2 {
      background-color: #e6a23c;
    } // 进行中：橙色
    .status-3 {
      background-color: #67c23a;
    } // 已完成：绿色
    .status-4 {
      background-color: #f56c6c;
    } // 已取消：红色

    // 优先级颜色，紧急使用最红的颜色
    .priority-1 {
      background-color: #67c23a;
    } // 低：绿色
    .priority-2 {
      background-color: #409eff;
    } // 中：蓝色
    .priority-3 {
      background-color: #e6a23c;
    } // 高：橙色
    .priority-4 {
      background-color: #f56c6c;
    } // 紧急：红色
  }
</style>
