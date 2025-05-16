<template>
  <el-drawer
    v-model="localVisible"
    :title="title || '菜单权限配置'"
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
          <p>勾选菜单项可分配访问权限，选择子项可开启/关闭操作权限</p>
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
          :props="defaultProps"
          @check="handleTreeCheck"
        >
          <template #default="{ node, data }">
            <div class="menu-tree-node" :class="{ 'auth-node': data.isAuth }">
              <!-- 菜单节点 - 去掉图标 -->
              <div v-if="!data.isAuth" class="menu-name-row">
                <span class="menu-title">{{ formatMenuTitle(data.meta?.title) || data.name }}</span>
              </div>

              <!-- 权限节点 - 改为按钮样式 -->
              <div v-else class="auth-name-row">
                <span class="auth-tag">{{ data.title }}</span>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="savePermissions" :loading="saveLoading">保存</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, nextTick, watch, computed, onMounted } from 'vue'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { getAllMenuByRole, saveRolePermission } from '@/api/system/api'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Document } from '@element-plus/icons-vue'

  // Props和Emits定义保持不变
  const props = defineProps({
    roleId: {
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

  // 本地状态
  const localVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const menuTreeRef = ref()
  const menus = ref([])
  const processedMenus = ref([])
  const loading = ref(false)
  const saveLoading = ref(false)
  const hasDataChanged = ref(false)

  // 树节点配置
  const defaultProps = {
    children: 'children',
    label: (data) => {
      if (data.isAuth) {
        return data.title
      }
      return formatMenuTitle(data.meta?.title) || data.name || '未命名菜单'
    }
  }

  // 监听角色ID和显示状态变化
  watch(
    () => [props.roleId, props.visible],
    ([newRoleId, isVisible]) => {
      if (isVisible && newRoleId) {
        loadRoleMenus(newRoleId)
      }
    }
  )

  // 初始化
  onMounted(() => {
    if (props.visible && props.roleId) {
      loadRoleMenus(props.roleId)
    }
  })

  // 加载角色菜单权限
  const loadRoleMenus = async (roleId) => {
    if (!roleId) return

    loading.value = true
    hasDataChanged.value = false

    try {
      const response = await getAllMenuByRole(Number(roleId))

      if (response.code === 200) {
        // 处理菜单数据，确保图标有效
        menus.value = processMenuIcons(response.data || [])
        // 转换菜单和权限为树形结构
        processedMenus.value = convertAuthsToTreeNodes(menus.value)

        // 使用nextTick确保DOM更新后再设置选中状态
        nextTick(() => {
          console.log('设置树节点选中状态')
          // 确保树组件已完全渲染后再设置选中状态
          setTimeout(() => {
            setTreeCheckedState()
          }, 100)
        })
      } else {
        ElMessage.error(response.message || '获取菜单权限失败')
      }
    } catch (error) {
      ElMessage.error('获取菜单权限失败，请稍后再试')
    } finally {
      loading.value = false
    }
  }

  // 处理菜单图标，确保有效
  const processMenuIcons = (menuList) => {
    return menuList.map((menu) => {
      // 深拷贝菜单项
      const menuItem = { ...menu }

      // 如果有图标但无效，清除图标
      if (menuItem.meta?.icon && !isValidIcon(menuItem.meta.icon)) {
        menuItem.meta = { ...menuItem.meta, icon: '' }
      }

      // 递归处理子菜单
      if (menuItem.children && menuItem.children.length > 0) {
        menuItem.children = processMenuIcons(menuItem.children)
      }

      return menuItem
    })
  }

  // 将权限转换为菜单的子节点
  const convertAuthsToTreeNodes = (menuList) => {
    return menuList.map((menu) => {
      const menuCopy = { ...menu }

      // 处理权限转换为子节点
      if (menuCopy.meta?.authList && menuCopy.meta.authList.length > 0) {
        // 创建权限子节点
        const authNodes = menuCopy.meta.authList.map((auth) => ({
          id: `auth_${menu.id}_${auth.id}`, // 创建唯一ID
          title: auth.title,
          auth_mark: auth.auth_mark,
          originalAuthId: auth.id,
          parentMenuId: menu.id,
          isAuth: true, // 标记为权限节点
          hasPermission: auth.hasPermission
        }))

        // 如果没有children数组，创建一个
        if (!menuCopy.children) {
          menuCopy.children = []
        }

        // 将权限节点添加到children中
        menuCopy.children = [...menuCopy.children, ...authNodes]
      }

      // 递归处理子菜单
      if (menuCopy.children && menuCopy.children.length > 0) {
        const originalChildren = menuCopy.children.filter((child) => !child.isAuth)
        if (originalChildren.length > 0) {
          const convertedChildren = convertAuthsToTreeNodes(originalChildren)
          // 替换原有子菜单，保留权限节点
          const authChildren = menuCopy.children.filter((child) => child.isAuth)
          menuCopy.children = [...convertedChildren, ...authChildren]
        }
      }

      return menuCopy
    })
  }

  // 验证图标名称是否有效
  const isValidIcon = (iconName: any): boolean => {
    if (!iconName || typeof iconName !== 'string') return false
    return !/[<>&;#]/.test(iconName)
  }

  // 设置树的选中状态 - 重写这个方法以确保正确勾选
  const setTreeCheckedState = () => {
    if (!menuTreeRef.value) return

    menuTreeRef.value.setCheckedKeys([])

    // 调试日志：输出处理后的菜单树结构
    console.log('处理后的菜单树结构:', JSON.stringify(processedMenus.value))

    // 收集所有应该被选中的节点ID
    const checkedKeys = []

    // 递归查找所有hasPermission为true的节点
    const findCheckedNodes = (nodes) => {
      if (!nodes || !nodes.length) return

      nodes.forEach((node) => {
        if (node.hasPermission === true) {
          console.log(`节点将被勾选: ${node.id}, 类型: ${node.isAuth ? '权限' : '菜单'}`)
          checkedKeys.push(node.id)
        }

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          findCheckedNodes(node.children)
        }
      })
    }

    // 执行查找
    findCheckedNodes(processedMenus.value)

    console.log(`找到 ${checkedKeys.length} 个需要勾选的节点:`, checkedKeys)

    // 先执行一次设置，确保基本选中逻辑正确
    if (checkedKeys.length > 0) {
      menuTreeRef.value.setCheckedKeys(checkedKeys)

      // 再次设置选中状态，确保完全应用
      setTimeout(() => {
        menuTreeRef.value.setCheckedKeys(checkedKeys)
      }, 50)
    }
  }

  // 处理树节点选中状态变化
  const handleTreeCheck = () => {
    hasDataChanged.value = true
  }

  // 递归收集选中的权限数据，用于保存
  const collectSelectedAuths = () => {
    // 在严格模式下只需要获取选中的节点，不需要半选中节点
    const checkedKeys = menuTreeRef.value.getCheckedKeys()

    // 克隆原始菜单树
    const clonedMenus = JSON.parse(JSON.stringify(menus.value))

    // 处理菜单和权限的选中状态
    const processNodePermissions = (menuList) => {
      if (!menuList || !menuList.length) return []

      return menuList.map((menu) => {
        // 检查菜单是否选中 - 不再需要考虑半选中状态
        menu.hasPermission = checkedKeys.includes(menu.id)

        // 处理权限列表
        if (menu.meta?.authList && menu.meta.authList.length > 0) {
          menu.meta.authList.forEach((auth) => {
            const authKey = `auth_${menu.id}_${auth.id}`
            auth.hasPermission = checkedKeys.includes(authKey)
          })
        }

        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
          menu.children = processNodePermissions(menu.children)
        }

        return menu
      })
    }

    // 更新权限状态
    return processNodePermissions(clonedMenus)
  }

  // 保存权限设置
  const savePermissions = async () => {
    if (!menuTreeRef.value || !props.roleId) {
      return
    }

    // 收集权限数据 - 与后端返回结构一致的菜单树
    const updatedMenus = collectSelectedAuths()

    try {
      saveLoading.value = true

      // 构建权限数据 - 转换为后端期望的格式
      const permissionData = {
        role_id: props.roleId,
        menu_data: JSON.stringify(updatedMenus)
      }

      // 调用保存API
      const response = await saveRolePermission(permissionData)

      if (response.code === 200) {
        emit('saved', { roleId: props.roleId, menus: updatedMenus })
        // 重置更改状态标志，然后关闭抽屉
        hasDataChanged.value = false
        handleClose(true) // 传递true表示跳过更改检查
      } else {
        ElMessage.error(response.message || '保存权限失败')
      }
    } catch (error) {
      ElMessage.error('保存权限失败，请稍后再试')
    } finally {
      saveLoading.value = false
    }
  }

  // 在树组件挂载后确认选中状态
  watch(
    () => processedMenus.value,
    (newMenus) => {
      if (newMenus && newMenus.length > 0) {
        nextTick(() => {
          setTreeCheckedState()
        })
      }
    }
  )

  // 关闭抽屉
  const handleClose = (skipCheck = false) => {
    if (hasDataChanged.value && !skipCheck) {
      ElMessageBox.confirm('有未保存的权限更改，确定要关闭吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          emit('update:visible', false)
        })
        .catch(() => {})
    } else {
      emit('update:visible', false)
    }
  }
</script>

<style lang="scss">
  .auth-drawer-namespace {
    // 调整抽屉内容区布局为垂直Flex
    .drawer-content {
      display: flex;
      flex-direction: column;
      height: 100%; // 确保容器撑满整个抽屉高度
    }

    // 头部固定
    .drawer-header {
      flex-shrink: 0; // 不收缩
      margin-bottom: 16px;
    }

    // 中间内容区可滚动
    .menu-tree-container {
      flex: 1; // 占据所有剩余空间
      overflow-y: auto; // 内容溢出时可滚动
      padding: 10px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
    }

    // 底部固定
    .drawer-footer {
      flex-shrink: 0; // 不收缩
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
    }

    .el-tree-node__content {
      height: auto !important;
      padding: 4px 0;
    }

    .menu-tree-node {
      margin-bottom: 2px;
      display: flex;
      align-items: center;

      &.auth-node {
        padding-left: 0; // 去掉额外的内边距
      }

      .menu-name-row {
        display: flex;
        align-items: center;
        padding: 4px 0;
        width: 100%;

        .menu-icon {
          margin-right: 8px;
        }

        .menu-title {
          font-weight: 500;
        }
      }

      .auth-name-row {
        display: flex;
        align-items: center;
        padding: 3px 0;

        .auth-tag {
          display: inline-block;
          padding: 3px 8px;
          font-size: 12px;
          border-radius: 4px;
          background-color: #ecf5ff;
          border: 1px solid #d9ecff;
          color: #409eff;
          margin-right: 8px;
          cursor: pointer;

          &:hover {
            background-color: #d9ecff;
          }
        }
      }
    }

    // 调整权限节点的样式
    .el-tree .el-tree-node.is-expanded > .el-tree-node__children {
      .auth-node {
        background-color: transparent;
        border-radius: 0;
        margin-left: 0; // 移除左侧缩进，与普通菜单对齐
        margin-top: 4px;
        margin-bottom: 4px;
      }
    }

    // 给权限标签增加轻微视觉区分，但不增加缩进
    .el-tree-node.is-expanded > .el-tree-node__children > .el-tree-node > .el-tree-node__content {
      .auth-name-row {
        position: relative;

        &:before {
          content: '';
          position: absolute;
          left: -16px; // 微调位置，保证不会影响实际对齐
          top: 50%;
          width: 6px;
          border-top: 1px solid #dcdfe6;
          opacity: 0.6;
        }
      }
    }

    // 父级菜单节点样式
    .el-tree-node.is-expanded > .el-tree-node__content {
      font-weight: 600;
    }

    .drawer-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    /* 修复半选中状态的横杠位置 - 增加更高优先级 */
    :deep(.el-tree-node) {
      .el-checkbox__input.is-indeterminate {
        .el-checkbox__inner {
          &::before {
            top: 50% !important;
            transform: translateY(-50%) !important;
            height: 2px !important;
          }
        }
      }
    }
  }
</style>
