<template>
  <div class="analysis-dashboard">
    <el-row :gutter="20">
      <el-col :xl="14" :lg="15" :xs="24">
        <TodaySales />
      </el-col>
      <el-col :xl="10" :lg="9" :xs="24">
        <VisitorInsights />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import TodaySales from './widget/TodaySales.vue'
  import VisitorInsights from './widget/VisitorInsights.vue'
  defineOptions({ name: 'AnalysisDashboard' })
</script>

<style lang="scss" scoped>
  .analysis-dashboard {
    padding-bottom: 20px;

    :deep(.custom-card) {
      background: var(--art-main-bg-color);
      border-radius: calc(var(--custom-radius) + 4px) !important;
    }

    // 卡片头部
    :deep(.custom-card-header) {
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;

      .title {
        font-size: 20px;
        font-weight: 400;
        color: var(--art-text-gray-900);
      }

      .subtitle {
        position: absolute;
        bottom: 2px;
        left: 21px;
        font-size: 13px;
        color: var(--art-gray-600);
      }
    }

    .el-card {
      border: 1px solid #e8ebf1;
      box-shadow: none;
    }

    .mt-20 {
      margin-top: 20px;
    }
  }

  .dark {
    .analysis-dashboard {
      :deep(.custom-card) {
        box-shadow: 0 4px 20px rgb(0 0 0 / 50%);
      }
    }
  }

  @media (width <= 1200px) {
    .analysis-dashboard {
      .mt-20 {
        margin-top: 0;
      }

      :deep(.custom-card) {
        margin-bottom: 20px;
      }
    }
  }
</style>
