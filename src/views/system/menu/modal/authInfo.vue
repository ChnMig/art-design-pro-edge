<template>
  <ElDialog
    v-model="dialogVisible"
    width="700px"
    align-center
    :close-on-click-modal="false"
    @closed="handleDialogClosed"
  >
    <template #header>
      <div class="dialog-title-with-help">
        <span>元素权限管理</span>
        <ElTooltip effect="dark" :content="helpContent" placement="top">
          <ElIcon class="help-icon" @click="showHelp"><QuestionFilled /></ElIcon>
        </ElTooltip>
      </div>
    </template>

    <ElButton type="primary" style="margin-bottom: 15px" @click="addAuthPermission">
      添加权限
    </ElButton>

    <!-- 表格部分保持不变 -->
    <ElTable v-loading="loading" :data="tableData" style="width: 100%">
      <ElTableColumn prop="title" label="权限名称" width="180" />
      <ElTableColumn prop="mark" label="权限标识" width="180" />
      <ElTableColumn label="操作">
        <template #default="scope">
          <ElButton size="small" @click="handleEdit(scope.$index, scope.row)">编辑</ElButton>
          <ElButton size="small" type="danger" @click="handleDelete(scope.row.id)">
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="closeDialog">取消</ElButton>
        <ElButton type="primary" @click="closeDialog">关闭</ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 添加/编辑权限的弹窗 -->
  <ElDialog v-model="authFormVisible" width="500px" append-to-body :close-on-click-modal="false">
    <template #header>
      <div class="dialog-title-with-help">
        <span>{{ isEditingAuth ? '编辑权限' : '添加权限' }}</span>
        <ElTooltip effect="dark" content="配置页面元素权限信息" placement="top">
          <ElIcon class="help-icon" @click="showAuthHelp"><QuestionFilled /></ElIcon>
        </ElTooltip>
      </div>
    </template>

    <ElForm ref="authFormRef" :model="authForm" :rules="authRules" label-width="100px">
      <ElFormItem label="权限名称" prop="title">
        <ElInput v-model="authForm.title" placeholder="请输入权限名称" />
      </ElFormItem>
      <ElFormItem label="权限标识" prop="mark">
        <ElInput v-model="authForm.mark" placeholder="请输入权限标识" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="authFormVisible = false">取消</ElButton>
        <ElButton type="primary" @click="submitAuthForm" :loading="submitLoading">提交</ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 帮助弹窗 -->
  <ElDialog v-model="helpDialogVisible" title="元素权限管理帮助" width="600px" append-to-body>
    <div class="help-content">
      <p>本功能用于管理页面内元素级权限，可以控制按钮等UI元素的显示和隐藏。</p>
      <p>权限标识的使用方法：</p>
      <ul>
        <li>在页面元素上使用v-auth指令控制元素显示</li>
        <li
          >例如：页面上有标签：<pre><code>&lt;el-button v-auth="'system:user:add'"&gt;新增&lt;/el-button&gt;</code></pre>
        </li>
        <li>如果用户没有`system:user:add`权限，则元素不会显示</li>
        <li>可以在按钮、表单、表格等需要权限控制的地方应用</li>
      </ul>
    </div>
  </ElDialog>

  <!-- 权限表单帮助弹窗 -->
  <ElDialog v-model="authHelpDialogVisible" title="权限配置帮助" width="600px" append-to-body>
    <div class="help-content">
      <p>权限名称：描述该权限的作用，例如"添加用户"、"删除角色"等</p>
      <p>权限标识：系统内使用的唯一标识，通常使用冒号分隔，例如：</p>
      <ul>
        <li>system:user:add - 系统模块用户管理添加权限</li>
        <li>system:role:delete - 系统模块角色管理删除权限</li>
      </ul>
      <p>命名规范：建议使用 "模块:功能:操作" 的格式</p>
    </div>
  </ElDialog>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getAuthList, addAuth, updateAuth, deleteAuth } from '@/api/system/api'
  import { ApiStatus } from '@/utils/http/status'
  import { QuestionFilled } from '@element-plus/icons-vue'

  const emit = defineEmits(['refresh'])
  const dialogVisible = ref(false)
  const currentMenu = ref<any>(null)
  const tableData = ref<any[]>([])
  const loading = ref(false)
  const submitLoading = ref(false)
  const helpDialogVisible = ref(false)
  const authHelpDialogVisible = ref(false)
  const helpContent = ref('点击查看帮助')

  // 权限表单相关
  const authFormVisible = ref(false)
  const isEditingAuth = ref(false)
  const authFormRef = ref<FormInstance>()
  const authForm = reactive({
    id: 0,
    title: '',
    mark: '',
    icon: '',
    menu_id: 0
  })

  const authRules = reactive<FormRules>({
    title: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    mark: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  })

  // 显示主弹窗并加载数据
  const showModal = async (row?: any) => {
    if (!row || !row.id) {
      ElMessage.warning('无法加载权限数据: 菜单ID无效')
      return
    }

    dialogVisible.value = true
    currentMenu.value = row
    loading.value = true

    try {
      // 向后端请求当前菜单的权限列表
      const response = await getAuthList(row.id)
      if (response.code === ApiStatus.success) {
        tableData.value = response.data || []
      } else {
        ElMessage.error(`获取权限列表失败: ${response.message}`)
        tableData.value = []
      }
    } catch (error) {
      console.error('获取权限列表出错:', error)
      ElMessage.error('获取权限列表失败，请检查网络连接')
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  // 添加权限
  const addAuthPermission = () => {
    if (!currentMenu.value || !currentMenu.value.id) {
      ElMessage.warning('无法添加权限: 菜单ID无效')
      return
    }

    isEditingAuth.value = false

    // 重置表单
    Object.assign(authForm, {
      id: 0,
      menu_id: currentMenu.value.id,
      title: '',
      mark: '',
      icon: ''
    })

    authFormVisible.value = true
  }

  // 编辑权限
  const handleEdit = (index: number, row: any) => {
    isEditingAuth.value = true

    // 填充表单数据
    Object.assign(authForm, {
      id: row.id,
      menu_id: row.menu_id || currentMenu.value.id,
      title: row.title,
      mark: row.mark,
      icon: row.icon || ''
    })

    authFormVisible.value = true
  }

  // 删除权限
  const handleDelete = async (id: number) => {
    if (!id) {
      ElMessage.warning('无效的权限ID')
      return
    }

    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      loading.value = true
      const res = await deleteAuth(id)

      if (res.code === ApiStatus.success) {
        ElMessage.success('删除成功')
        // 重新加载数据
        await showModal(currentMenu.value)
      } else {
        ElMessage.error(`删除失败: ${res.message}`)
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除权限出错:', error)
        ElMessage.error('删除失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 提交权限表单
  const submitAuthForm = async () => {
    if (!authFormRef.value) return

    await authFormRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        const formData = { ...authForm }
        let res

        if (isEditingAuth.value && formData.id) {
          // 编辑权限
          res = await updateAuth(formData)
        } else {
          // 添加权限
          res = await addAuth(formData)
        }

        if (res.code === ApiStatus.success) {
          ElMessage.success(`${isEditingAuth.value ? '编辑' : '添加'}权限成功`)
          authFormVisible.value = false
          // 重新加载数据
          await showModal(currentMenu.value)
        } else {
          ElMessage.error(`${isEditingAuth.value ? '编辑' : '添加'}权限失败: ${res.message}`)
        }
      } catch (error) {
        console.error('提交权限表单出错:', error)
        ElMessage.error(`${isEditingAuth.value ? '编辑' : '添加'}权限失败`)
      } finally {
        submitLoading.value = false
      }
    })
  }

  // 关闭弹窗的处理函数
  const closeDialog = () => {
    dialogVisible.value = false
    emit('refresh') // 触发刷新事件
  }

  // 对话框关闭事件处理函数
  const handleDialogClosed = () => {
    emit('refresh') // 在弹窗完全关闭后触发刷新事件
  }

  const showHelp = () => {
    helpDialogVisible.value = true
  }

  const showAuthHelp = () => {
    authHelpDialogVisible.value = true
  }

  // 对外暴露方法
  defineExpose({
    showModal
  })
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

  .dialog-title-with-help {
    display: flex;
    align-items: center;

    .help-icon {
      margin-left: 8px;
      font-size: 16px;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }

  .help-content {
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: bold;
    }

    p {
      margin: 8px 0;
      line-height: 1.6;
    }

    ul {
      padding-left: 20px;

      li {
        margin-bottom: 4px;
      }
    }
  }
</style>
