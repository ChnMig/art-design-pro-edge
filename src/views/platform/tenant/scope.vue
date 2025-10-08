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
          :data="processedMenus"
          show-checkbox
          node-key="id"
          default-expand-all
          :check-strictly="false"
          :default-checked-keys="defaultCheckedKeys"
          :props="defaultProps"
        >
          <template #default="{ data }">
            <div class="menu-tree-node" :class="{ 'auth-node': data.isAuth }">
              <div v-if="!data.isAuth" class="menu-name-row">
                <span class="menu-title">{{ formatMenuTitle(data.meta?.title) || data.name }}</span>
              </div>
              <div v-else class="auth-name-row">
                <span class="auth-tag">{{ data.title }}</span>
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
  import { getPlatformTenantMenu, savePlatformTenantMenu } from '@/api/platform/api'

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
  const processedMenus = ref<any[]>([])
  const loading = ref(false)
  const saveLoading = ref(false)

  const defaultProps = {
    children: 'children',
    label: (data: any) =>
      data.isAuth ? data.title : formatMenuTitle(data.meta?.title) || data.name || '未命名菜单'
  }

  const defaultCheckedKeys = computed<(number | string)[]>(() => {
    const keys: (number | string)[] = []
    const walk = (nodes: any[]) => {
      nodes?.forEach((n) => {
        if (isPermitted(n)) keys.push(n.id)
        if (n.children?.length) walk(n.children)
      })
    }
    walk(processedMenus.value)
    return keys
  })

  // 加载菜单 + 权限（平台端 GET /platform/menu?tenant_id）
  const loadTenantScope = async (tenantId: number) => {
    if (!tenantId) return
    loading.value = true
    try {
      const list = await getPlatformTenantMenu(Number(tenantId))
      // http 客户端直接返回 data
      if (list) {
        menus.value = processMenuIcons(Array.isArray(list) ? list : list.data || [])
        processedMenus.value = convertAuthsToTreeNodes(menus.value)
        await ensureTreeReady()
        setTreeCheckedState()
      } else {
        ElMessage.error('获取菜单范围失败')
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
    try {
      saveLoading.value = true
      const updatedMenus = collectSelectedAuths()
      await savePlatformTenantMenu({ tenant_id: tenantId, menu_data: JSON.stringify(updatedMenus) })
      ElMessage.success('保存成功')
      emit('saved', { tenantId })
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
  // helpers continue in same script block
  // 工具函数与节点转换（复制自角色抽屉，保持一致）
  const processMenuIcons = (menuList: any[]) => {
    return (menuList || []).map((menu) => {
      const m = { ...menu }
      if (m.meta?.icon && !isValidIcon(m.meta.icon)) {
        m.meta = { ...m.meta, icon: '' }
      }
      if (m.children?.length) m.children = processMenuIcons(m.children)
      return m
    })
  }

  const isValidIcon = (iconName: any): boolean => {
    if (!iconName || typeof iconName !== 'string') return false
    return !/[<>&;#]/.test(iconName)
  }

  const convertAuthsToTreeNodes = (menuList: any[]) => {
    return (menuList || []).map((menu) => {
      const menuCopy = { ...menu }
      if (menuCopy.meta?.authList?.length) {
        const authNodes = menuCopy.meta.authList.map((auth: any) => ({
          id: `auth_${menu.id}_${auth.id}`,
          title: auth.title,
          authMark: auth.authMark,
          originalAuthId: auth.id,
          parentMenuId: menu.id,
          isAuth: true,
          hasPermission: resolvePermissionFlag(auth)
        }))
        if (!menuCopy.children) menuCopy.children = []
        menuCopy.children = [...menuCopy.children, ...authNodes]
      }
      if (menuCopy.children?.length) {
        const originalChildren = menuCopy.children.filter((c: any) => !c.isAuth)
        const convertedChildren = convertAuthsToTreeNodes(originalChildren)
        const authChildren = menuCopy.children.filter((c: any) => c.isAuth)
        menuCopy.children = [...convertedChildren, ...authChildren]
      }
      // 兼容：hasPermission 可能在 meta 上
      if (
        menuCopy.hasPermission === undefined &&
        menuCopy.meta &&
        'hasPermission' in menuCopy.meta
      ) {
        // @ts-expect-error meta 可能未声明 hasPermission，运行时存在
        menuCopy.hasPermission = resolvePermissionFlag(menuCopy.meta)
      }
      return menuCopy
    })
  }

  const setTreeCheckedState = () => {
    if (!menuTreeRef.value) return
    const checked: (number | string)[] = []
    const walk = (nodes: any[]) => {
      nodes?.forEach((n) => {
        if (isPermitted(n)) checked.push(n.id)
        if (n.children?.length) walk(n.children)
      })
    }
    walk(processedMenus.value)
    menuTreeRef.value.setCheckedKeys([])
    if (checked.length > 0) {
      menuTreeRef.value.setCheckedKeys(checked)
      setTimeout(() => menuTreeRef.value?.setCheckedKeys(checked), 50)
    }
  }

  const collectSelectedAuths = () => {
    const keys = (menuTreeRef.value?.getCheckedKeys() || []) as (number | string)[]
    const cloned = JSON.parse(JSON.stringify(menus.value))
    const mark = (list: any[]): any[] =>
      list.map((m) => {
        m.hasPermission = keys.includes(m.id)
        if (m.meta?.authList?.length) {
          m.meta.authList.forEach((a: any) => {
            const key = `auth_${m.id}_${a.id}`
            a.hasPermission = keys.includes(key)
          })
        }
        if (m.children?.length) m.children = mark(m.children)
        return m
      })
    return mark(cloned)
  }
  // 确保 Tree 已渲染
  const ensureTreeReady = async () => {
    let tries = 0
    while (!menuTreeRef.value && tries < 10) {
      tries++
      await nextTick()
      await new Promise((r) => setTimeout(r, 16))
    }
  }
  // 兼容性判断：布尔/数字/字符串
  const resolvePermissionFlag = (obj: any): boolean => {
    const v = obj?.hasPermission
    return v === true || v === 1 || v === '1'
  }

  const isPermitted = (node: any): boolean => {
    if (node && 'hasPermission' in node) return resolvePermissionFlag(node)
    if (node?.meta && 'hasPermission' in node.meta) return resolvePermissionFlag(node.meta)
    return false
  }
  // end helpers
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
      align-items: flex-start; // 靠左对齐
      width: 100%;
      margin-bottom: 2px;

      .menu-name-row {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 4px 0;
      }

      .auth-name-row {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 3px 0;

        .auth-tag {
          display: inline-block;
          padding: 3px 8px;
          margin-right: 8px;
          font-size: 12px;
          color: #409eff;
          cursor: pointer;
          background-color: #ecf5ff;
          border: 1px solid #d9ecff;
          border-radius: 4px;

          &:hover {
            background-color: #d9ecff;
          }
        }
      }
    }
  }
</style>
