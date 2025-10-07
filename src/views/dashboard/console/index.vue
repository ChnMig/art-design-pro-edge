<template>
  <div class="console">
    <CardList></CardList>

    <el-row :gutter="20">
      <el-col :sm="24" :md="12" :lg="10">
        <ActiveUser />
      </el-col>
      <el-col :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :sm="24" :md="12" :lg="12">
        <Dynamic />
      </el-col>
      <el-col :sm="24" :md="12" :lg="12">
        <TodoList />
      </el-col>
    </el-row>

    <AboutProject />
  </div>
</template>

<script setup lang="ts">
  import CardList from './widget/CardList.vue'
  import ActiveUser from './widget/ActiveUser.vue'
  import SalesOverview from './widget/SalesOverview.vue'
  import Dynamic from './widget/Dynamic.vue'
  import TodoList from './widget/TodoList.vue'
  import AboutProject from './widget/AboutProject.vue'
  import { useCommon } from '@/composables/useCommon'

  defineOptions({ name: 'Console' })

  useCommon().scrollToTop()
</script>

<style lang="scss" scoped>
  @use './style';
</style>
