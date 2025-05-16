<template>
  <div class="page-content">
    <el-row :gutter="12">
      <el-col :span="3" class="el-col2">
        <el-button @click="showMenuModal('add-menu-levle1', null, true)" v-ripple
          >添加菜单</el-button
        >
      </el-col>
    </el-row>
    <art-table :data="tableData" :pagination="false">
      <template #default>
        <el-table-column label="菜单名称" align="center">
          <template #default="scope">
            {{ formatMenuTitle(scope.row.meta?.title) }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由" align="center" />
        <el-table-column prop="meta.authList" label="元素权限">
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
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.meta.isEnable ? 'primary' : 'warning'">
              {{ scope.row.meta.isEnable ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template #default="scope">
            <ArtButtonTable type="add" @click="showMenuModal('add-menu-levle2', scope.row)" />
            <ArtButtonTable type="edit" @click="handleEdit('edit', scope.row)" />
            <ArtButtonTable type="delete" @click="delMenu(scope.row.id)" />
          </template>
        </el-table-column>
      </template>
    </art-table>
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
  import { onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { getAllMenu, deleteMenu } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'
  import menuInfo from './modal/menuInfo.vue'
  import authInfo from './modal/authInfo.vue'
  import { useAuth } from '@/composables/useAuth'
  const { hasAuth } = useAuth()
  const tableData = ref<any[]>([])
  const menuModalRef = ref()
  const authModalRef = ref()
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
