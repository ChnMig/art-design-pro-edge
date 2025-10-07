<template>
  <div class="role-page art-full-height" id="table-full-screen">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="searchParams"
      :items="searchItems"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />

    <ElCard shadow="never" class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refresh">
        <template #left>
          <ElButton @click="showDialog('add')">添加角色</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :table-config="{ rowKey: 'id' }"
        :layout="{ marginTop: 10 }"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 角色弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
        width="500px"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
          <ElFormItem label="角色名称" prop="name">
            <ElInput v-model="form.name" placeholder="请输入角色名称" />
          </ElFormItem>
          <ElFormItem label="描述" prop="desc">
            <ElInput v-model="form.desc" type="textarea" :rows="3" placeholder="请输入角色描述" />
          </ElFormItem>
          <ElFormItem label="启用">
            <ElSwitch v-model="form.status" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="dialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="handleSubmit(formRef)" :loading="submitLoading"
              >提交</ElButton
            >
          </div>
        </template>
      </ElDialog>

      <RoleAuth
        v-model:visible="permissionDrawer"
        :role-id="currentRoleId"
        @saved="handlePermissionSaved"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h, resolveComponent, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getRoleList, addRole, updateRole, deleteRole } from '@/api/system/api'
  import RoleAuth from './auth.vue'
  import { useTable } from '@/composables/useTable'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  // 由于 ButtonMoreItem 仅为类型，需单独定义类型
  type ButtonMoreItem = {
    key: string | number
    label: string
    disabled?: boolean
    auth?: string
  }
  import { SearchFormItem } from '@/types'

  // 搜索表单配置项
  const searchItems: SearchFormItem[] = [
    {
      label: '角色名称',
      key: 'name',
      type: 'input',
      clearable: true,
      placeholder: '请输入角色名称'
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      clearable: true,
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 }
      ]
    }
  ]

  // 表单数据
  const form = reactive({
    id: '',
    name: '',
    desc: '',
    status: true
  })
  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const currentRoleId = ref<number | undefined>(undefined)
  const formRef = ref<FormInstance>()
  const permissionDrawer = ref(false)

  // 表单验证规则
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    desc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  // 操作按钮列表
  const actionButtons: ButtonMoreItem[] = [
    { key: 'permission', label: '菜单权限' },
    { key: 'edit', label: '编辑角色' },
    { key: 'delete', label: '删除角色' }
  ]

  // useTable 适配
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData: getDataByPage,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshAll: refresh
  } = useTable<any>({
    core: {
      apiFn: getRoleList,
      apiParams: {
        page: 1,
        pageSize: 10,
        name: '',
        status: undefined
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '角色名称',
          align: 'center'
        },
        {
          prop: 'desc',
          label: '描述',
          align: 'center',
          showOverflowTooltip: true
        },
        {
          prop: 'users',
          label: '用户数量',
          align: 'center',
          formatter: (row: any) => (Array.isArray(row.users) ? row.users.length : 0)
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          formatter: (row: any) =>
            h(
              resolveComponent('ElTag'),
              { type: row.status === 1 ? 'primary' : 'warning' },
              { default: () => (row.status === 1 ? '启用' : '禁用') }
            )
        },
        {
          prop: 'operation',
          label: '操作',
          align: 'center',
          width: 160,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', { class: 'operation-column-container' }, [
              h(ArtButtonMore, {
                list: actionButtons,
                onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
              })
            ])
        }
      ]
    },
    hooks: {
      onError: (error) => ElMessage.error(error.message)
    }
  })

  // 操作按钮点击事件
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

  // 弹窗相关
  const showDialog = (type: string, row?: any) => {
    dialogType.value = type
    dialogVisible.value = true
    nextTick(() => {
      formRef.value?.resetFields()
      if (type === 'edit' && row) {
        form.id = row.id
        form.name = row.name
        form.desc = row.desc
        form.status = row.status === 1
      } else {
        form.id = ''
        form.name = ''
        form.desc = ''
        form.status = true
      }
    })
  }

  // 权限抽屉
  const showPermissionDrawer = (row: any) => {
    currentRoleId.value = row.id
    permissionDrawer.value = true
  }

  const handlePermissionSaved = () => {
    ElMessage.success('权限设置已保存')
    refresh()
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
            refresh()
          } else {
            ElMessage.error(response.message || '删除失败')
          }
        } catch (err) {
          console.error('删除角色出错:', err)
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
            status: form.status ? 1 : 0
          }
          const response =
            dialogType.value === 'add'
              ? await addRole(roleData)
              : await updateRole({ id: form.id, ...roleData })
          if (response.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
            dialogVisible.value = false
            refresh()
          } else {
            ElMessage.error(response.message || '操作失败')
          }
        } catch (err) {
          console.error('提交表单出错:', err)
          ElMessage.error('操作失败，请稍后再试')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .role-page {
    // 添加表格容器样式
    .table-container {
      flex: 1;
      min-height: 0; // 重要：允许容器收缩
      padding: 16px; // 根据需求调整内边距
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

    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      vertical-align: -8px;
      fill: currentcolor;
    }

    .operation-column-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
