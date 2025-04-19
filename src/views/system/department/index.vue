<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetSearch"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="部门名称" prop="name" v-model="searchForm.name" />
            <el-col :span="8">
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="searchForm.status"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="启用" :value="1" />
                  <el-option label="禁用" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')" v-ripple>添加部门</el-button>
      </template>
    </table-bar>

    <el-config-provider>
      <art-table
        :data="filteredData"
        :currentPage="pagination.currentPage"
        :pageSize="pagination.pageSize"
        :total="pagination.total"
        :loading="loading"
        :hideOnSinglePage="false"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      >
        <template #default>
          <el-table-column prop="name" label="名称" align="center" v-if="columns[0].show" />
          <el-table-column
            prop="sort"
            label="排序"
            sortable
            align="center"
            v-if="columns[1].show"
          />
          <el-table-column prop="users" label="人数" align="center" v-if="columns[2].show">
            <template #default="scope">
              {{ Array.isArray(scope.row.users) ? scope.row.users.length : 0 }}
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" align="center" v-if="columns[3].show">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'primary' : 'warning'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" align="center">
            <template #default="scope">
              <ArtButtonTable type="edit" @click="showDialog('edit', scope.row)" />
              <ArtButtonTable type="delete" @click="deleteDepartment(scope.row.id)" />
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-config-provider>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
      width="600px"
      align-center
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="85px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="formData.sort"
                style="width: 100%"
                :min="1"
                controls-position="right"
                placeholder="请输入排序号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用" prop="status">
              <el-switch v-model="formData.status" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    getDepartmentList,
    addDepartment,
    updateDepartment,
    deleteDepartment as apiDeleteDepartment
  } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const currentId = ref<number | null>(null)
  const searchName = ref('')

  const formData = reactive({
    name: '',
    sort: '1',
    status: true
  })

  const tableData = ref<any[]>([])

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    sort: [
      { required: true, message: '请输入排序号', trigger: 'blur' },
      { pattern: /^[0-9]*$/, message: '请输入数字', trigger: 'blur' }
    ]
  })

  // 在组件挂载时获取部门列表
  onMounted(async () => {
    await refreshDepartmentList()
  })

  // 刷新部门列表
  const refreshDepartmentList = async () => {
    loading.value = true
    try {
      const res = await getDepartmentList()
      if (res.code === ApiStatus.success) {
        tableData.value = res.data || []
      } else {
        ElMessage.error(`获取部门列表失败: ${res.message}`)
      }
    } catch (error) {
      console.error('获取部门列表出错:', error)
      ElMessage.error('获取部门列表失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }

  // 搜索部门
  const searchDepartments = async () => {
    await refreshDepartmentList()
    if (searchName.value) {
      tableData.value = tableData.value.filter((item) =>
        item.name.toLowerCase().includes(searchName.value.toLowerCase())
      )
    }
  }

  // 重置搜索条件并刷新列表
  const resetSearch = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    pagination.currentPage = 1
    refreshDepartmentList()
  }

  const resetForm = () => {
    formData.name = ''
    formData.sort = '1'
    formData.status = true
    currentId.value = null
  }

  const showDialog = (type: string, row?: any) => {
    dialogType.value = type
    dialogVisible.value = true

    if (type === 'edit' && row) {
      currentId.value = row.id
      formData.name = row.name
      formData.sort = String(row.sort)
      formData.status = row.status === 1
    } else {
      resetForm()
    }
  }

  const deleteDepartment = (id: number) => {
    ElMessageBox.confirm('确定要删除该部门吗？', '删除部门', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        loading.value = true
        try {
          const res = await apiDeleteDepartment(id)
          if (res.code === ApiStatus.success) {
            ElMessage.success('删除部门成功')
            await refreshDepartmentList()
          } else {
            ElMessage.error(`删除部门失败: ${res.message}`)
          }
        } catch (error) {
          console.error('删除部门出错:', error)
          ElMessage.error('删除部门失败')
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        // 用户取消删除，不做任何操作
      })
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          const params = {
            name: formData.name,
            sort: parseInt(formData.sort),
            status: formData.status ? 1 : 0
          }

          if (dialogType.value === 'edit') {
            // 编辑部门
            if (!currentId.value) {
              ElMessage.error('部门ID无效')
              return
            }

            const res = await updateDepartment({
              ...params,
              id: currentId.value
            })

            if (res.code === ApiStatus.success) {
              ElMessage.success('修改部门成功')
              dialogVisible.value = false
              await refreshDepartmentList()
            } else {
              ElMessage.error(`修改部门失败: ${res.message}`)
            }
          } else {
            // 添加部门
            const res = await addDepartment(params)

            if (res.code === ApiStatus.success) {
              ElMessage.success('添加部门成功')
              dialogVisible.value = false
              await refreshDepartmentList()
            } else {
              ElMessage.error(`添加部门失败: ${res.message}`)
            }
          }
        } catch (error) {
          console.error('提交表单出错:', error)
          ElMessage.error(`${dialogType.value === 'add' ? '添加' : '修改'}部门失败`)
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  const columns = reactive([
    { name: '名称', show: true },
    { name: '排序', show: true },
    { name: '人数', show: true },
    { name: '状态', show: true }
  ])

  const searchForm = reactive({
    name: '',
    status: null
  })

  const searchFormRef = ref<FormInstance>()

  // 简化搜索函数
  const search = () => {
    pagination.currentPage = 1
  }

  // 更新分页处理函数，不再需要重新加载数据
  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
  }

  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
  }

  const changeColumn = (newColumns: any) => {
    columns.forEach((column, index) => {
      column.show = newColumns[index].show
    })
  }

  // 使用计算属性处理筛选和分页
  const filteredData = computed(() => {
    let result = [...tableData.value]

    // 根据搜索条件筛选数据
    if (searchForm.name) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.status !== null) {
      result = result.filter((item) => item.status === searchForm.status)
    }

    // 计算总数
    pagination.total = result.length

    // 处理分页
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return result.slice(start, end)
  })
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

    .el-col2 {
      display: flex;
      gap: 10px;
    }
  }
</style>
