<template>
  <el-drawer
    v-model="localVisible"
    :title="title || '菜单范围配置'"
    direction="rtl"
    size="30%"
    :before-close="handleClose"
    :destroy-on-close="false"
    :close-on-click-modal="false"
    append-to-body
    class="auth-drawer-namespace"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <el-alert type="info" :closable="false" show-icon>
          <p>勾选菜单项以分配该租户可用的菜单范围</p>
        </el-alert>
      </div>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else class="menu-tree-container">
        <el-tree
          ref="menuTreeRef"
          :data="menus"
          show-checkbox
          node-key="id"
          default-expand-all
          :check-strictly="false"
          :props="defaultProps"
        >
          <template #default="{ data }">
            <div class="menu-tree-node">
              <div class="menu-name-row">
                <span class="menu-title">{{ formatMenuTitle(data.meta?.title) || data.name }}</span>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="saveScope" :loading="saveLoading">保存</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, watch, computed, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { formatMenuTitle } from '@/router/utils/utils'
  import {
    getPlatformMenu,
    getPlatformMenuScope,
    updatePlatformMenuScope
  } from '@/api/platform/api'

  const props = defineProps({
    tenantId: {
      type: [Number, String],
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['update:visible', 'saved'])

  // 本地可见性
  const localVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const menuTreeRef = ref()
  const menus = ref<any[]>([])
  const loading = ref(false)
  const saveLoading = ref(false)

  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || data.name || '未命名菜单'
  }

  // 加载菜单树（仅菜单节点）并应用当前租户范围
  const loadTenantScope = async (tenantId: number) => {
    if (!tenantId) return
    loading.value = true
    try {
      const list = await getPlatformMenu()
      menus.value = Array.isArray(list) ? list : []

      await nextTick()
      const scope = await getPlatformMenuScope(Number(tenantId))
      const ids: number[] = Array.isArray(scope?.menu_ids)
        ? scope.menu_ids
        : scope?.data?.menu_ids || []
      if (menuTreeRef.value) {
        menuTreeRef.value.setCheckedKeys(ids)
        setTimeout(() => menuTreeRef.value?.setCheckedKeys(ids), 30)
      }
    } catch (e) {
      console.error('加载菜单范围失败', e)
      ElMessage.error('加载失败')
    } finally {
      loading.value = false
    }
  }

  // 保存
  const saveScope = async () => {
    const tenantId = Number(props.tenantId)
    if (!tenantId || !menuTreeRef.value) return
    const checked = menuTreeRef.value.getCheckedKeys() as Array<number | string>
    const menu_ids = checked.filter((v) => typeof v === 'number') as number[]
    try {
      saveLoading.value = true
      await updatePlatformMenuScope({ tenant_id: tenantId, menu_ids })
      ElMessage.success('保存成功')
      emit('saved', { tenantId, menu_ids })
      emit('update:visible', false)
    } catch (e) {
      console.error('保存菜单范围失败', e)
      ElMessage.error('保存失败')
    } finally {
      saveLoading.value = false
    }
  }

  const handleClose = () => emit('update:visible', false)

  // 打开时加载
  watch(
    () => [props.visible, props.tenantId],
    ([v, id]) => {
      if (v && id) loadTenantScope(Number(id))
    }
  )
</script>

<style lang="scss" scoped>
  .auth-drawer-namespace {
    .drawer-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 12px;
    }

    .drawer-header {
      margin-bottom: 16px;
    }

    .menu-tree-container {
      flex: 1;
      padding: 10px 0;
      overflow-y: auto;
      background-color: transparent;
    }

    .drawer-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
      margin-top: 16px;
    }

    :deep(.el-drawer__body) {
      background-color: #fff !important;
    }

    :deep(.el-alert) {
      background-color: transparent !important;
      border: none !important;
    }

    :deep(.el-tree) {
      background-color: transparent !important;
    }

    .menu-tree-node {
      display: flex;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 2px;

      .menu-name-row {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 4px 0;
      }
    }
  }
</style>
