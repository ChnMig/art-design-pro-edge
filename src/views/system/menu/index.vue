<template>
  <div class="page-content">
    <el-row :gutter="20" style="margin-left: 15px">
      <el-button v-auth="'add'" @click="showMenuModal('menu', null, true)" v-ripple
        >添加菜单</el-button
      >
    </el-row>
    <art-table :data="tableData">
      <template #default>
        <el-table-column label="菜单名称">
          <template #default="scope">
            {{ formatMenuTitle(scope.row.meta?.title) }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由" />
        <el-table-column prop="meta.authList" label="元素权限">
          <template #default="scope">
            <el-popover
              placement="top-start"
              title="操作"
              :width="200"
              trigger="click"
              v-for="(item, index) in scope.row.meta.authList"
              :key="index"
            >
              <div style="margin: 0; text-align: right">
                <el-button size="small" type="primary" @click="showMenuModal('button', item)"
                  >编辑</el-button
                >
                <el-button size="small" type="danger" @click="deleteAuth()">删除</el-button>
              </div>
              <template #reference>
                <el-button class="small-btn">{{ item.title }}</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="启用">
          <template #default="scope">
            <el-switch v-model="scope.row.meta.isEnable" size="small" disabled />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="scope">
            <button-table type="add" v-auth="'add'" @click="showMenuModal('menu')" />
            <button-table type="edit" v-auth="'edit'" @click="handleEdit('edit', scope.row)" />
            <button-table type="delete" v-auth="'delete'" @click="delMenu(scope.row.id)" />
          </template>
        </el-table-column>
      </template>
    </art-table>
    <!-- 引用菜单弹窗组件 -->
    <menu-info ref="menuModalRef" @refresh="refreshMenuList" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { formatMenuTitle } from '@/utils/menu'
  import { getAllMenu, deleteMenu } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'
  import menuInfo from './modal/menuInfo.vue'
  const tableData = ref<any[]>([])
  const menuModalRef = ref()
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
  const deleteAuth = async () => {
    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      ElMessage.success('删除成功')
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
</style>
