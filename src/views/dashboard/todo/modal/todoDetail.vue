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

      <el-tab-pane label="评论" name="comments">
        <div class="comments-container" v-loading="commentLoading">
          <el-empty description="暂无评论数据" v-if="!commentLoading && comments.length === 0" />
          <div v-else class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.creator_name || '匿名用户' }}</span>
                <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>

          <div class="comment-input-container">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="请输入评论内容"
              class="comment-input"
            />
            <div class="comment-button">
              <el-button type="primary" @click="submitComment" :loading="submitLoading">
                发布评论
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="进度日志" name="logs">
        <div class="placeholder-content">
          <el-empty description="暂无进度日志" />
          <!-- 后续可添加进度日志功能 -->
        </div>
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
  import { ref, PropType, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getTodoComment, addTodoComment } from '@/api/system/api'
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
  const getTagType = (status) => {
    switch (status) {
      case 1:
        return 'info' // 未处理
      case 2:
        return 'warning' // 处理中
      case 3:
        return 'success' // 已完成
      case 4:
        return 'danger' // 已取消
      default:
        return 'info'
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

  // 评论相关
  const comments = ref<any[]>([])
  const commentLoading = ref(false)
  const newComment = ref('')
  const submitLoading = ref(false)

  // 监听标签页切换和对话框可见性
  watch([() => activeTab.value, () => props.dialogVisible], async ([tab, visible]) => {
    if (tab === 'comments' && visible && props.todoData?.id) {
      await loadComments()
    }
  })

  // 加载评论列表
  const loadComments = async () => {
    if (!props.todoData?.id) return

    commentLoading.value = true
    try {
      const res = await getTodoComment({ todo_id: props.todoData.id })
      if (res.code === ApiStatus.success) {
        comments.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取评论失败')
      }
    } catch (error) {
      console.error('获取评论出错:', error)
      ElMessage.error('获取评论失败')
    } finally {
      commentLoading.value = false
    }
  }

  // 提交新评论
  const submitComment = async () => {
    if (!newComment.value.trim()) {
      ElMessage.warning('请输入评论内容')
      return
    }

    if (!props.todoData?.id) {
      ElMessage.error('任务ID无效')
      return
    }

    submitLoading.value = true
    try {
      const res = await addTodoComment({
        todo_id: props.todoData.id,
        content: newComment.value.trim()
      })

      if (res.code === ApiStatus.success) {
        ElMessage.success('评论发布成功')
        newComment.value = ''
        await loadComments() // 重新加载评论列表
      } else {
        ElMessage.error(res.message || '评论发布失败')
      }
    } catch (error) {
      console.error('发布评论出错:', error)
      ElMessage.error('评论发布失败')
    } finally {
      submitLoading.value = false
    }
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

  .placeholder-content {
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .comments-container {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .comments-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .comment-item {
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .comment-author {
    font-weight: bold;
  }

  .comment-time {
    color: #999;
    font-size: 12px;
  }

  .comment-content {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-input-container {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
  }

  .comment-input {
    margin-bottom: 10px;
  }

  .comment-button {
    display: flex;
    justify-content: flex-end;
  }
</style>
