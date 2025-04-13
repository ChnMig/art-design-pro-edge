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
            <form-input label="菜单名称" prop="title" v-model="searchForm.title" />
            <form-input label="路由" prop="path" v-model="searchForm.path" />
            <el-col :span="8">
              <el-form-item label="状态" prop="isEnable">
                <el-select
                  v-model="searchForm.isEnable"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="启用" :value="true" />
                  <el-option label="禁用" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showMenuModal('add-menu-levle1', null, true)" v-ripple
          >添加菜单</el-button
        >
      </template>
    </table-bar>

    <el-config-provider>
      <art-table
        :data="filteredTableData"
        :currentPage="pagination.currentPage"
        :pageSize="pagination.pageSize"
        :total="pagination.total"
        :hideOnSinglePage="false"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      >
        <template #default>
          <el-table-column label="菜单名称" align="center" v-if="columns[0].show">
            <template #default="scope">
              {{ formatMenuTitle(scope.row.meta?.title) }}
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路由" align="center" v-if="columns[1].show" />
          <el-table-column prop="meta.authList" label="元素权限" v-if="columns[2].show">
            <template #default="scope">
              <el-badge
                :value="scope.row.meta.authList?.length || 0"
                class="item"
                type="primary"
                :show-zero="false"
              >
                <el-button
                  class="share-button"
                  icon="More"
                  size="small"
                  style="margin: 0; text-align: right"
                  @click="showAuthModal(scope.row)"
                />
              </el-badge>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" v-if="columns[3].show">
            <template #default="scope">
              <el-tag :type="scope.row.meta.isEnable ? 'primary' : 'warning'">
                {{ scope.row.meta.isEnable ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" align="center">
            <template #default="scope">
              <button-table type="add" @click="showMenuModal('add-menu-levle2', scope.row)" />
              <button-table type="edit" @click="handleEdit('edit', scope.row)" />
              <button-table type="delete" @click="delMenu(scope.row.id)" />
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-config-provider>

    <!-- 引用菜单弹窗组件 -->
    <menu-info ref="menuModalRef" @refresh="refreshMenuList" />
    <!-- 引用权限弹窗组件 -->
    <auth-info ref="authModalRef" @refresh="refreshMenuList" />
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="700px"
      align-center
      :close-on-click-modal="false"
    >
      <!-- 内容不变... -->
    </el-dialog>

    <!-- 添加/编辑权限的弹窗 -->
    <el-dialog
      :title="isEditingAuth ? '编辑权限' : '添加权限'"
      v-model="authFormVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <!-- 内容不变... -->
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, reactive, computed } from 'vue'
  import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
  import { formatMenuTitle } from '@/utils/menu'
  import { getAllMenu, deleteMenu } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'
  import menuInfo from './modal/menuInfo.vue'
  import authInfo from './modal/authInfo.vue'

  const tableData = ref<any[]>([])
  const menuModalRef = ref()
  const authModalRef = ref()
  const loading = ref(false)
  const searchFormRef = ref<FormInstance>()

  // 分页配置
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 列设置
  const columns = reactive([
    { name: '菜单名称', show: true },
    { name: '路由', show: true },
    { name: '元素权限', show: true },
    { name: '状态', show: true }
  ])

  // 搜索表单
  const searchForm = reactive({
    title: '',
    path: '',
    isEnable: undefined
  })

  onMounted(async () => {
    await refreshMenuList()
  })

  const refreshMenuList = async () => {
    // 向后端查询数据
    const menuRes = await getAllMenu()
    if (menuRes.code === ApiStatus.success) {
      tableData.value = menuRes.data
    } else {
      ElMessage.error('获取菜单列表失败')
      tableData.value = []
    }
  }
  const showMenuModal = (type: string, row?: any, lock: boolean = false) => {
    menuModalRef.value.showModal(type, row, lock)
  }
  const handleEdit = (type: string, row: any) => {
    showMenuModal('menu', row, true)
  }
  const showAuthModal = (row: any) => {
    authModalRef.value.showModal(row)
  }
  const delMenu = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const res = await deleteMenu(id)
      if (res.code === ApiStatus.success) {
        ElMessage.success('删除成功')
      } else {
        console.error(res.message)
        ElMessage.error('删除失败: ' + res.message)
      }
      await refreshMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const search = () => {
    pagination.currentPage = 1
  }

  const resetSearch = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    pagination.currentPage = 1
  }

  const changeColumn = (newColumns: any) => {
    columns.forEach((column, index) => {
      column.show = newColumns[index].show
    })
  }

  const handleCurrentChange = (newPage: number) => {
    pagination.currentPage = newPage
  }

  const handleSizeChange = (newSize: number) => {
    pagination.pageSize = newSize
    pagination.currentPage = 1
  }

  const filteredTableData = computed(() => {
    let result = [...tableData.value]

    // 基于表单进行筛选
    if (searchForm.title) {
      result = result.filter((item) =>
        item.meta?.title?.toLowerCase().includes(searchForm.title.toLowerCase())
      )
    }

    if (searchForm.path) {
      result = result.filter((item) =>
        item.path?.toLowerCase().includes(searchForm.path.toLowerCase())
      )
    }

    if (searchForm.isEnable !== undefined) {
      result = result.filter((item) => item.meta?.isEnable === searchForm.isEnable)
    }

    // 计算分页后的数据
    pagination.total = result.length
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

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }
  }

  .item {
    margin-top: 10px;
    margin-right: 30px;
  }

  .el-col2 {
    display: flex;
    gap: 10px;
  }
</style>
