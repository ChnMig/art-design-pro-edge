<template>
  <el-sub-menu
    v-if="isNotEmpty(item.children)"
    :index="item.path || item.meta.title"
    :level="level"
  >
    <template #title>
      <i
        class="menu-icon iconfont-sys"
        :style="{ color: theme?.iconColor }"
        v-html="item.meta.icon"
      ></i>
      <span>{{ formatMenuTitle(item.meta.title) }}</span>
    </template>
    <!-- 递归菜单 -->
    <HorizontalSubmenu
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      @close="closeMenu"
      :level="level + 1"
      :theme="theme"
    />
  </el-sub-menu>

  <el-menu-item
    v-if="!isNotEmpty(item.children) && !item.meta.isHide"
    :index="item.path || item.meta.title"
    @click="goPage(item)"
    :level-item="level + 1"
  >
    <template #title>
      <i class="menu-icon iconfont-sys" v-html="item.meta.icon"></i>
      <span>{{ formatMenuTitle(item.meta.title) }}</span>
      <div class="badge" v-if="item.meta.showBadge"></div>
    </template>
  </el-menu-item>
</template>

<script lang="ts" setup>
  import type { AppRouteRecord } from '@/types/router'
  import { handleMenuJump } from '@/utils/navigation'
  import { formatMenuTitle } from '@/router/utils/utils'

  defineProps({
    item: {
      type: Object as PropType<AppRouteRecord>,
      required: true
    },
    theme: {
      type: Object,
      default: () => ({})
    },
    isMobile: Boolean,
    level: {
      type: Number,
      default: 0
    }
  })

  const emit = defineEmits(['close'])

  const goPage = (item: AppRouteRecord) => {
    closeMenu()
    handleMenuJump(item)
  }

  const closeMenu = () => {
    emit('close')
  }

  const isNotEmpty = (children: AppRouteRecord[] | undefined) => {
    return children && children.length > 0
  }
</script>

<style lang="scss" scoped>
  .el-sub-menu {
    padding: 0 !important;

    :deep(.el-sub-menu__title) {
      padding: 0 30px 0 15px !important;

      .el-sub-menu__icon-arrow {
        right: 10px !important;
      }
    }
  }

  .menu-icon {
    margin-right: 5px;
    font-size: 16px;
  }
</style>
