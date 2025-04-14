<template>
  <el-dialog
    :modelValue="dialogVisible"
    @update:modelValue="$emit('update:dialogVisible', $event)"
    title="任务详情"
    width="800px"
    align-center
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="任务详情" name="details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{
            todoData?.title || '--'
          }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{
            todoData?.assignee_name || '--'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建者">{{
            todoData?.creator_name || '--'
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatDate(todoData?.created_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{
            formatDate(todoData?.deadline, false)
          }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{
            formatDate(todoData?.updated_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getTagType(todoData?.status)">{{
              getStatusLabel(todoData?.status)
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(todoData?.priority)" effect="dark">{{
              getPriorityLabel(todoData?.priority)
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            <div class="description-content">{{ todoData?.content || '--' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="任务进度" name="progress">
        <div class="timeline-container" v-loading="timelineLoading">
          <div class="timeline-header">
            <el-button type="primary" size="small" @click="showAddProgressDialog">
              添加进度节点
            </el-button>
          </div>

          <el-empty
            description="暂无进度记录"
            v-if="!timelineLoading && timelineData.length === 0"
          />

          <el-timeline v-else>
            <el-timeline-item
              v-for="(item, index) in timelineData"
              :key="index"
              :timestamp="formatDate(item.SystemUserTodoStep.created_at)"
              :type="getTimelineItemType(item.SystemUserTodoStep)"
            >
              <div class="timeline-item-content">
                <div class="timeline-item-header">
                  <span class="timeline-title">
                    {{ item.operator_name ? item.operator_name : '系统' }}
                  </span>
                  <!-- 状态标签已被移除 -->
                </div>
                <div class="timeline-description">{{ item.SystemUserTodoStep.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 添加进度节点对话框 -->
        <el-dialog
          v-model="progressDialogVisible"
          title="添加进度节点"
          width="500px"
          append-to-body
        >
          <el-form
            ref="progressFormRef"
            :model="progressForm"
            :rules="progressRules"
            label-width="80px"
          >
            <el-form-item label="进度内容" prop="content">
              <el-input
                v-model="progressForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入进度内容，例如：任务处理中，已完成30%"
              />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="progressDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitProgress" :loading="submitLoading">
                确定
              </el-button>
            </div>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:dialogVisible', false)">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, PropType, watch, reactive } from 'vue'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { getTodoTimeline, addTodoProgress } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'

  // 定义属性
  const props = defineProps({
    dialogVisible: {
      type: Boolean,
      default: false
    },
    todoData: {
      type: Object as PropType<any>,
      default: () => null
    }
  })

  // 定义事件
  const emit = defineEmits(['update:dialogVisible'])

  // 当前活动的标签页
  const activeTab = ref('details')

  // 状态选项
  const statusOptions = [
    { value: 1, label: '未处理' },
    { value: 2, label: '处理中' },
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

  // 格式化日期
  const formatDate = (dateOrTimestamp, showTime = true) => {
    if (!dateOrTimestamp) return '--'

    let date
    // 处理时间戳（数字）
    if (typeof dateOrTimestamp === 'number') {
      date = new Date(dateOrTimestamp * 1000) // 假设后端返回的是秒级时间戳
    }
    // 处理日期字符串
    else {
      date = new Date(dateOrTimestamp)
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) return '--'

    // 根据参数决定是否显示时间
    if (showTime) {
      return date
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        .replace(/\//g, '-') // 将所有的斜杠替换为连字符
    } else {
      // 对于只显示日期的情况，确保输出格式为 YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }

  // 获取状态标签类型
  const getTagType = (item) => {
    if (typeof item === 'number') {
      // 针对数字类型的状态码
      switch (item) {
        case 1:
          return 'info'
        case 2:
          return 'warning'
        case 3:
          return 'success'
        case 4:
          return 'danger'
        default:
          return 'info'
      }
    } else if (item && typeof item === 'object') {
      // 针对进度项对象
      const content = item.content.toLowerCase()
      if (content.includes('已完成') || content.includes('完成')) {
        return 'success'
      } else if (content.includes('取消') || content.includes('终止')) {
        return 'danger'
      } else if (content.includes('处理中') || content.includes('进行中')) {
        return 'warning'
      } else {
        return 'info'
      }
    }
    return 'info'
  }

  // 获取时间线项的类型
  const getTimelineItemType = (item) => {
    const content = item.content.toLowerCase()
    if (content.includes('已完成') || content.includes('完成')) {
      return 'success'
    } else if (content.includes('取消') || content.includes('终止')) {
      return 'danger'
    } else if (content.includes('处理中') || content.includes('进行中')) {
      return 'warning'
    } else {
      return 'primary' // 默认类型
    }
  }

  // 获取状态标签文本
  const getStatusLabel = (status) => {
    const option = statusOptions.find((item) => item.value === status)
    return option ? option.label : '--'
  }

  // 获取优先级标签类型
  const getPriorityType = (priority) => {
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
  const getPriorityLabel = (priority) => {
    const option = priorityOptions.find((item) => item.value === priority)
    return option ? option.label : '--'
  }

  // 获取进度状态标签
  const getProgressStatusLabel = (item) => {
    // 根据内容判断状态
    const content = item.content.toLowerCase()
    if (content.includes('已完成') || content.includes('完成')) {
      return '已完成'
    } else if (content.includes('取消') || content.includes('终止')) {
      return '已取消'
    } else {
      return '' // 不显示默认状态
    }
  }

  // 进度时间线相关
  const timelineData = ref<any[]>([])
  const timelineLoading = ref(false)
  const submitLoading = ref(false)
  const progressDialogVisible = ref(false)
  const progressFormRef = ref<FormInstance>()

  // 进度表单
  const progressForm = reactive({
    content: ''
  })

  // 表单验证规则
  const progressRules = reactive<FormRules>({
    content: [{ required: true, message: '请输入进度内容', trigger: 'blur' }]
  })

  // 监听标签页切换和对话框可见性
  watch([() => activeTab.value, () => props.dialogVisible], async ([tab, visible]) => {
    if (tab === 'progress' && visible && props.todoData?.id) {
      await loadTimeline()
    }
  })

  // 加载时间线数据
  const loadTimeline = async () => {
    if (!props.todoData?.id) return

    timelineLoading.value = true
    try {
      const res = await getTodoTimeline({ todo_id: props.todoData.id })
      if (res.code === ApiStatus.success) {
        timelineData.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取进度时间线失败')
      }
    } catch (error) {
      console.error('获取进度时间线出错:', error)
      ElMessage.error('获取进度时间线失败')
    } finally {
      timelineLoading.value = false
    }
  }

  // 显示添加进度节点对话框
  const showAddProgressDialog = () => {
    // 重置表单
    progressForm.content = ''

    // 显示对话框
    progressDialogVisible.value = true
  }

  // 提交进度节点
  const submitProgress = async () => {
    if (!progressFormRef.value) return

    await progressFormRef.value.validate(async (valid) => {
      if (!valid) return

      if (!props.todoData?.id) {
        ElMessage.error('任务ID无效')
        return
      }

      submitLoading.value = true
      try {
        const data = {
          system_user_todo_id: props.todoData.id,
          content: progressForm.content
        }

        const res = await addTodoProgress(data)

        if (res.code === ApiStatus.success) {
          ElMessage.success('进度节点添加成功')
          progressDialogVisible.value = false
          await loadTimeline() // 重新加载时间线数据
        } else {
          ElMessage.error(res.message || '进度节点添加失败')
        }
      } catch (error) {
        console.error('添加进度节点出错:', error)
        ElMessage.error('进度节点添加失败')
      } finally {
        submitLoading.value = false
      }
    })
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

  .description-content {
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
    padding: 8px;
    background-color: #f8f8f8;
    border-radius: 4px;
  }

  .timeline-container {
    min-height: 300px;

    :deep(.el-timeline) {
      padding-left: 28px; // 增加左侧padding，让时间线节点有足够空间显示

      .el-timeline-item__node {
        left: 0;
        z-index: 1;
      }

      .el-timeline-item__tail {
        left: 4px;
      }
    }
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-weight: 500;
    }
  }

  .timeline-item-content {
    padding: 10px;
    background-color: #f8f8f8;
    border-radius: 4px;
  }

  .timeline-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .timeline-title {
    font-weight: 500;
    font-size: 16px;
  }

  .timeline-description {
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 8px;
  }

  .timeline-footer {
    display: flex;
    justify-content: flex-end;
    font-size: 12px;
    color: #999;
  }

  .status-option {
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
    }
    .status-2 {
      background-color: #e6a23c;
    }
    .status-3 {
      background-color: #67c23a;
    }
    .status-4 {
      background-color: #f56c6c;
    }
  }
</style>
