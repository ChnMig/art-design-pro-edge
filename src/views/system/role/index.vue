<template>
  <div class="page-content">
    <el-row :gutter="12">
      <el-col :span="3" :offset="21" class="el-col2">
        <el-button @click="showDialog('add')" v-ripple>新增角色</el-button>
      </el-col>
    </el-row>

    <art-table :data="tableData" :loading="loading">
      <template #default>
        <el-table-column label="角色名称" prop="name" />
        <el-table-column label="描述" prop="desc" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'primary' : 'warning'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 新增用户数量列 -->
        <el-table-column label="用户数量" align="center">
          <template #default="scope">
            {{ scope.row.users ? scope.row.users.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100px">
          <template #default="scope">
            <el-row>
              <button-more
                :list="[
                  { key: 'permission', label: '菜单权限' },
                  { key: 'edit', label: '编辑角色' },
                  { key: 'delete', label: '删除角色' }
                ]"
                @click="buttonMoreClick($event, scope.row)"
              />
            </el-row>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加 :close-on-click-modal="false" 禁止点击背景关闭 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
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

    <!-- 添加 :close-on-click-modal="false" 禁止点击背景关闭 -->
    <el-dialog
      v-model="permissionDialog"
      title="菜单权限"
      width="30%"
      :close-on-click-modal="false"
    >
      <div :style="{ maxHeight: '500px', overflowY: 'scroll' }">
        <el-tree
          :data="menuList"
          show-checkbox
          node-key="id"
          :default-expanded-keys="[1, 2, 3, 4, 5, 6, 7, 8]"
          :default-checked-keys="[1, 2, 3]"
          :props="defaultProps"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { formatMenuTitle } from '@/utils/menu'
  import { getRoleList, addRole, updateRole, deleteRole } from '@/api/system/api'
  import { onMounted } from 'vue'

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const menuList = computed(() => useMenuStore().getMenuList)
  const loading = ref(false)
  const submitLoading = ref(false)
  const searchKeyword = ref('')

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    desc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  const form = reactive({
    id: '',
    name: '',
    desc: '',
    status: true
  })

  const tableData = ref([])

  const dialogType = ref('add')

  // 获取角色列表
  const fetchRoleList = async () => {
    loading.value = true
    try {
      // 如果有搜索关键词，则传递搜索参数
      const response = await getRoleList(
        searchKeyword.value ? { keyword: searchKeyword.value } : undefined
      )

      console.log('API角色列表响应:', response)

      if (response.code === 200) {
        // 修改为匹配API的状态码
        // 直接使用response.data，因为它已经是数组
        tableData.value = response.data || []
        console.log('设置后的tableData:', tableData.value)
      } else {
        ElMessage.error(response.message || '获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表出错:', error)
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

  // 在组件挂载时获取角色列表
  onMounted(() => {
    fetchRoleList()
  })

  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      form.id = row.id
      form.name = row.name
      form.desc = row.desc // 修改为使用desc字段
      form.status = row.status === 1
    } else {
      form.id = ''
      form.name = ''
      form.desc = ''
      form.status = true
    }
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: any) => {
    if (item.key === 'permission') {
      showPermissionDialog()
    } else if (item.key === 'edit') {
      showDialog('edit', row)
    } else if (item.key === 'delete') {
      deleteRoleAction(row.id)
    }
  }

  const showPermissionDialog = () => {
    permissionDialog.value = true
  }

  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || ''
  }

  // 删除角色
  const deleteRoleAction = (id: number) => {
    ElMessageBox.confirm('确定删除该角色吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        try {
          const response = await deleteRole(id)
          if (response.code === 200) {
            // 修改为匹配API的状态码
            ElMessage.success('删除成功')
            fetchRoleList() // 重新获取角色列表
          } else {
            ElMessage.error(response.message || '删除失败')
          }
        } catch (error) {
          console.error('删除角色出错:', error)
          ElMessage.error('删除失败，请稍后再试')
        }
      })
      .catch(() => {})
  }

  // 提交表单（新增或编辑）
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true

        try {
          const roleData = {
            name: form.name,
            desc: form.desc,
            status: form.status ? 1 : 2 // 修改这里：启用为1，禁用为2
          }

          let response
          if (dialogType.value === 'add') {
            response = await addRole(roleData)
          } else {
            response = await updateRole({
              id: form.id,
              ...roleData
            })
          }

          if (response.code === 200) {
            const message = dialogType.value === 'add' ? '新增成功' : '修改成功'
            ElMessage.success(message)
            dialogVisible.value = false // 关闭弹窗
            formEl.resetFields() // 重置表单
            fetchRoleList() // 重新获取角色列表
          } else {
            ElMessage.error(response.message || '操作失败')
          }
        } catch (error) {
          console.error('提交表单出错:', error)
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
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
  }

  .el-col2 {
    display: flex;
    gap: 10px;
  }
</style>
