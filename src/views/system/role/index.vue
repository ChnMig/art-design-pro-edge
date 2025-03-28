<template>
  <div class="page-content">
    <el-row :gutter="12">
      <el-col :span="3" class="el-col2">
        <el-button @click="showDialog('add')" v-ripple>添加角色</el-button>
      </el-col>
    </el-row>
    <art-table :data="tableData" :loading="loading" empty-text="暂无角色数据" :pagination="false">
      <template #default>
        <el-table-column label="角色名称" prop="name" align="center" />
        <el-table-column label="描述" prop="desc" show-overflow-tooltip align="center" />
        <el-table-column label="状态" prop="status" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'primary' : 'warning'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户数量" align="center">
          <template #default="scope">
            {{ scope.row.users ? scope.row.users.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="scope">
            <el-row>
              <button-more :list="actionButtons" @click="buttonMoreClick($event, scope.row)" />
            </el-row>
          </template>
        </el-table-column>
      </template>
    </art-table>

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
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="禁用" />
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
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import { Search } from '@element-plus/icons-vue'
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { formatMenuTitle } from '@/utils/menu'
  import { getRoleList, addRole, updateRole, deleteRole, getAllMenuByRole } from '@/api/system/api'
  import RoleAuth from './auth.vue'

  // 状态变量
  const dialogVisible = ref(false)
  const permissionDrawer = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const searchKeyword = ref('')
  const currentRoleId = ref(null)
  const formRef = ref<FormInstance>()
  const dialogType = ref('add')
  const tableData = ref([])

  // 操作按钮列表
  const actionButtons = [
    { key: 'permission', label: '菜单权限' },
    { key: 'edit', label: '编辑角色' },
    { key: 'delete', label: '删除角色' }
  ]

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

  // 搜索处理
  const handleSearch = () => {
    fetchRoleList()
  }

  // 获取角色列表
  const fetchRoleList = async () => {
    loading.value = true
    try {
      const params = searchKeyword.value ? { keyword: searchKeyword.value.trim() } : undefined
      const response = await getRoleList(params)

      if (response.code === 200) {
        tableData.value = response.data || []
      } else {
        ElMessage.error(response.message || '获取角色列表失败')
      }
    } catch (error) {
      ElMessage.error('获取角色列表失败，请稍后再试')
    } finally {
      loading.value = false
    }
  }

  // 重置搜索
  const resetSearch = () => {
    searchKeyword.value = ''
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
        } catch (error) {
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
        } catch (error) {
          ElMessage.error('操作失败，请稍后再试')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .page-content {
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
  }
</style>
