<template>
  <div class="platform-scope-page art-full-height">
    <ArtSearchBar
      v-model="searchState"
      :items="searchItems"
      :showExpand="false"
      :buttonLeftLimit="1"
      @search="handleRefresh"
      @reset="handleReset"
    />

    <ElCard shadow="never" class="art-table-card">
      <div class="toolbar">
        <div class="tips">为指定租户分配可用的菜单集合</div>
        <div class="actions">
          <ElButton type="primary" @click="handleSave" :loading="saving" v-ripple
            >保存范围</ElButton
          >
        </div>
      </div>

      <div class="tree-wrapper" v-loading="loading">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          show-checkbox
          node-key="id"
          default-expand-all
          :check-strictly="false"
          :props="treeProps"
        >
          <template #default="{ data }">
            <div class="tree-node">
              <span class="menu-title">{{ formatMenuTitle(data.meta?.title) || data.name }}</span>
            </div>
          </template>
        </el-tree>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, nextTick, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { getTenantList } from '@/api/system/api'
  import {
    getPlatformMenu,
    getPlatformMenuScope,
    updatePlatformMenuScope
  } from '@/api/platform/api'
  import type { SearchFormItem } from '@/types'

  defineOptions({ name: 'PlatformMenuScope' })

  const treeRef = ref<any>()
  const loading = ref(false)
  const saving = ref(false)
  const menuTree = ref<any[]>([])

  // 搜索/筛选区（仅租户）
  const searchState = reactive<{ tenant_id?: number }>({ tenant_id: undefined })
  const tenantOptions = ref<{ label: string; value: number }[]>([])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '所属租户',
      key: 'tenant_id',
      type: 'select',
      clearable: false,
      placeholder: '请选择租户',
      options: tenantOptions.value
    }
  ])

  const treeProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || data.name || '未命名菜单'
  }

  // 加载平台菜单树
  const loadMenus = async () => {
    const menus = await getPlatformMenu()
    // 仅保留菜单节点（不包含元素权限）
    menuTree.value = Array.isArray(menus) ? menus : []
  }

  // 根据租户加载范围并设置勾选
  const applyScopeForTenant = async (tenantId: number) => {
    if (!tenantId) return
    const scope = await getPlatformMenuScope(tenantId)
    // scope 结构：{ tenant_id, menu_ids: number[] }
    const ids: number[] = Array.isArray(scope?.menu_ids)
      ? scope.menu_ids
      : scope?.data?.menu_ids || []
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(ids)
      // 再次设置，确保生效
      nextTick(() => treeRef.value.setCheckedKeys(ids))
    }
  }

  const handleRefresh = async () => {
    if (!searchState.tenant_id) {
      ElMessage.warning('请先选择租户')
      return
    }
    loading.value = true
    try {
      await loadMenus()
      await nextTick()
      await applyScopeForTenant(searchState.tenant_id)
    } catch (e) {
      console.error('加载菜单范围失败', e)
      ElMessage.error('加载失败')
    } finally {
      loading.value = false
    }
  }

  const handleReset = async () => {
    if (tenantOptions.value.length > 0) {
      searchState.tenant_id = tenantOptions.value[0].value
      await handleRefresh()
    }
  }

  const collectCheckedMenuIds = (): number[] => {
    if (!treeRef.value) return []
    const checked: Array<number | string> = treeRef.value.getCheckedKeys()
    // 只保留数字ID
    return checked.filter((v) => typeof v === 'number') as number[]
  }

  const handleSave = async () => {
    const tenantId = searchState.tenant_id
    if (!tenantId) {
      ElMessage.warning('请先选择租户')
      return
    }
    const menuIds = collectCheckedMenuIds()
    saving.value = true
    try {
      await updatePlatformMenuScope({ tenant_id: tenantId, menu_ids: menuIds })
      ElMessage.success('保存成功')
    } catch (e) {
      console.error('保存菜单范围失败', e)
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  }

  onMounted(async () => {
    try {
      const resp = await getTenantList({ page: 1, pageSize: 1000 })
      const list = Array.isArray((resp as any).data) ? (resp as any).data : resp
      tenantOptions.value = (Array.isArray(list) ? list : []).map((t: any) => ({
        label: `${t.name} (${t.code})`,
        value: t.id
      }))
      if (tenantOptions.value.length > 0) {
        searchState.tenant_id = tenantOptions.value[0].value
        await handleRefresh()
      }
    } catch (e) {
      console.error('加载租户失败', e)
    }
  })
</script>

<style lang="scss" scoped>
  .platform-scope-page {
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .tips {
        color: var(--text-color-secondary);
      }
    }

    .tree-wrapper {
      min-height: 420px;
      padding: 6px 4px;
    }

    .tree-node {
      display: inline-flex;
      align-items: center;
      padding: 4px 0;

      .menu-title {
        font-weight: 500;
      }
    }
  }
</style>
