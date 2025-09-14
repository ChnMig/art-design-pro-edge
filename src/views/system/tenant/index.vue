<template>
  <div class="system-tenant">
    <el-card shadow="never">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item label="租户编码">
            <el-input
              v-model="searchForm.code"
              placeholder="请输入租户编码"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="租户名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入租户名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增租户
        </el-button>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="租户编码" width="150" />
        <el-table-column prop="name" label="租户名称" width="200" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expires_at" label="到期时间" width="180">
          <template #default="scope">
            <span v-if="scope.row.expires_at">
              {{ formatDate(scope.row.expires_at) }}
            </span>
            <span v-else class="text-gray-500">永不过期</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              :disabled="scope.row.code === 'default'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="租户编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入租户编码"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="到期时间" prop="expires_at">
          <el-date-picker
            v-model="formData.expires_at"
            type="datetime"
            placeholder="选择到期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="X"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getTenantList, addTenant, updateTenant, deleteTenant } from '@/api/system/api'

defineOptions({ name: 'SystemTenant' })

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  status: undefined as number | undefined
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)

// 表单
const formRef = ref<FormInstance>()
const formData = reactive({
  id: 0,
  code: '',
  name: '',
  description: '',
  status: 1,
  expires_at: undefined as string | undefined
})

const formRules: FormRules = {
  code: [
    { required: true, message: '请输入租户编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入租户名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 255, message: '长度不能超过 255 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取租户列表
const getTenants = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      ...searchForm
    }
    const res = await getTenantList(params)
    console.log('租户列表响应:', res)

    if (res && res.data) {
      tableData.value = res.data
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('获取租户列表失败:', error)
    ElMessage.error('获取租户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getTenants()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    code: '',
    name: '',
    status: undefined
  })
  pagination.page = 1
  getTenants()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增租户'
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑租户'
  isEdit.value = true
  dialogVisible.value = true

  // 复制数据到表单
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    status: row.status,
    expires_at: row.expires_at
  })
}

// 删除
const handleDelete = async (row: any) => {
  if (row.code === 'default') {
    ElMessage.warning('默认租户不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除租户 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteTenant(row.id)
    ElMessage.success('删除成功')
    getTenants()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除租户失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const data = {
      ...formData,
      expires_at: formData.expires_at ? parseInt(formData.expires_at) : undefined
    }

    if (isEdit.value) {
      await updateTenant(data)
      ElMessage.success('更新成功')
    } else {
      await addTenant(data)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    getTenants()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  Object.assign(formData, {
    id: 0,
    code: '',
    name: '',
    description: '',
    status: 1,
    expires_at: undefined
  })
}

// 分页事件
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
  getTenants()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  getTenants()
}

// 格式化时间
const formatDate = (timestamp: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString()
}

// 初始化
onMounted(() => {
  getTenants()
})
</script>

<style lang="scss" scoped>
.system-tenant {
  .search-section {
    margin-bottom: 20px;
  }

  .action-section {
    margin-bottom: 20px;
  }

  .pagination-section {
    margin-top: 20px;
    text-align: right;
  }

  .text-gray-500 {
    color: #9ca3af;
  }
}
</style>