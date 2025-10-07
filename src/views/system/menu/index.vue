<template>
  <div class="page-content art-full-height">
    <!-- 表格头部 -->
    <ArtTableHeader
      :columnList="columnOptions"
      v-model:columns="columnChecks"
      @refresh="handleRefresh"
    >
      <template #left>
        <ElButton @click="showMenuModal('add-menu-levle1', null, true)" v-ripple>
          添加菜单
        </ElButton>
      </template>
    </ArtTableHeader>

    <!-- 表格 -->
    <ArtTable
      :data="tableData"
      :columns="columns"
      :loading="isLoading"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="isExpanded"
      :layout="{ marginTop: 10 }"
      :show-pagination="false"
    />

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
  import { onMounted, ref, computed, h, resolveComponent } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ApiStatus } from '@/utils/http/status'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { getAllMenu, deleteMenu } from '@/api/system/api'
  import { useTable } from '@/composables/useTable'
  import menuInfo from './modal/menuInfo.vue'
  import authInfo from './modal/authInfo.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  const isExpanded = ref(false) // 默认全部收起
  const menuModalRef = ref()
  const authModalRef = ref()

  // 使用 useTable 管理表格数据
  const tableApi = useTable<any>({
    core: {
      apiFn: getAllMenu,
      immediate: true,
      columnsFactory: () => [
        {
          prop: 'meta.title',
          label: '菜单名称',
          align: 'center',
          formatter: (row: any) => formatMenuTitle(row.meta?.title) || '--'
        },
        {
          prop: 'path',
          label: '路由',
          align: 'center'
        },
        {
          prop: 'meta.authList',
          label: '元素权限',
          align: 'center',
          formatter: (row: any) =>
            h('div', { class: 'auth-list-cell' }, [
              h(
                'el-badge',
                {
                  value: row.meta?.authList?.length || 0,
                  type: 'primary',
                  'show-zero': false
                },
                {
                  default: () =>
                    h('el-button', {
                      class: 'share-button',
                      icon: 'More',
                      size: 'small',
                      style: 'margin: 0; text-align: right',
                      onClick: () => showAuthModal(row)
                    })
                }
              )
            ])
        },
        {
          prop: 'meta.isEnable',
          label: '状态',
          align: 'center',
          formatter: (row: any) =>
            h(
              resolveComponent('ElTag'),
              {
                type: row.meta?.isEnable ? 'primary' : 'warning'
              },
              {
                default: () => (row.meta?.isEnable ? '启用' : '禁用')
              }
            )
        },
        {
          prop: 'operation',
          label: '操作',
          align: 'center',
          width: 180,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', { class: 'operation-column-container' }, [
              h(ArtButtonTable, {
                type: 'add',
                style: 'margin-right: 8px;',
                onClick: () => showMenuModal('add-menu-levle2', row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                style: 'margin-right: 8px;',
                onClick: () => handleEdit('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => delMenu(row.id)
              })
            ])
        }
      ]
    },
    transform: {
      responseAdapter: (data) => {
        // HTTP client now returns data directly, no need to check response.code
        const menuData = Array.isArray(data) ? data : []
        return {
          data: menuData,
          total: menuData.length,
          current: 1,
          size: menuData.length
        }
      }
    },
    hooks: {
      onError: (error) => ElMessage.error(error.message)
    }
  })

  const { tableData, isLoading, columns, columnChecks, refreshAll } = tableApi

  // 列配置选项
  const columnOptions = [
    { label: '菜单名称', prop: 'meta.title' },
    { label: '路由', prop: 'path' },
    { label: '元素权限', prop: 'meta.authList' },
    { label: '状态', prop: 'meta.isEnable' },
    { label: '操作', prop: 'operation' }
  ]

  // 刷新表格数据
  const handleRefresh = () => {
    refreshAll()
  }

  // 刷新菜单列表（兼容原有方法）
  const refreshMenuList = async () => {
    await refreshAll()
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

  // 兼容原有的 dialogVisible 等变量（如果弹窗组件需要）
  const dialogVisible = ref(false)
  const authFormVisible = ref(false)
  const dialogTitle = computed(() => '菜单详情')
  const isEditingAuth = ref(false)

  onMounted(async () => {
    // useTable 会自动加载数据，这里不需要手动调用
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

    .auth-list-cell {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .operation-column-container {
      display: flex;
      align-items: center;
      justify-content: center;
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
