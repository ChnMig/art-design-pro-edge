<template>
  <section class="search-bar art-custom-card">
    <ElForm :model="filter" :label-position="props.labelPosition">
      <ElRow class="search-form-row" :gutter="props.gutter">
        <ElCol
          v-for="item in useFormItemArr"
          :key="item.prop"
          :xs="24"
          :sm="12"
          :md="item.elColSpan || props.elColSpan"
          :lg="item.elColSpan || props.elColSpan"
          :xl="item.elColSpan || props.elColSpan"
        >
          <ElFormItem :label="`${item.label}`" :prop="item.prop" :label-width="props.labelWidth">
            <component
              :is="getComponent(item.type)"
              v-model:value="filter[item.prop]"
              :item="item"
            />
          </ElFormItem>
        </ElCol>
        <ElCol
          :xs="24"
          :sm="24"
          :md="props.elColSpan"
          :lg="props.elColSpan"
          :xl="props.elColSpan"
          class="action-column"
        >
          <div
            class="action-buttons-wrapper"
            :style="{
              'justify-content': isMobile
                ? 'flex-end'
                : props.items.length <= props.buttonLeftLimit
                  ? 'flex-start'
                  : 'flex-end'
            }"
          >
            <div class="form-buttons">
              <ElButton class="reset-button" @click="$emit('reset')" v-ripple>重置</ElButton>
              <ElButton type="primary" class="search-button" @click="$emit('search')" v-ripple
                >搜索</ElButton
              >
            </div>
            <div
              v-if="!props.isExpand && props.showExpand"
              class="filter-toggle"
              @click="isShow = !isShow"
            >
              <span>{{ isShow ? '收起' : '展开' }}</span>
              <div class="icon-wrapper">
                <ElIcon>
                  <ArrowUpBold v-if="isShow" />
                  <ArrowDownBold v-else />
                </ElIcon>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ArrowUpBold, ArrowDownBold } from '@element-plus/icons-vue'
  import { useWindowSize } from '@vueuse/core'
  import ArtSearchInput from './widget/art-search-input/index.vue'
  import ArtSearchSelect from './widget/art-search-select/index.vue'
  import ArtSearchRadio from './widget/art-search-radio/index.vue'
  import ArtSearchDate from './widget/art-search-date/index.vue'
  import { SearchComponentType, SearchFormItem } from '@/types'
  import { ElForm } from 'element-plus'

  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < 500)

  type FilterVo = string | number | undefined | null | unknown[]

  interface PropsVO {
    filter: Record<string, FilterVo> // 查询参数
    items: SearchFormItem[] // 表单数据
    elColSpan?: number // 每列的宽度（基于 24 格布局）
    gutter?: number // 表单控件间隙
    isExpand?: boolean // 展开/收起
    labelPosition?: 'left' | 'right' // 表单域标签的位置
    labelWidth?: string // 文字宽度
    showExpand?: boolean // 是否需要展示，收起
    buttonLeftLimit?: number // 按钮靠左对齐限制（表单项小于等于该值时）
  }

  const props = withDefaults(defineProps<PropsVO>(), {
    elColSpan: 6,
    gutter: 12,
    isExpand: false,
    labelPosition: 'right',
    labelWidth: '70px',
    showExpand: true,
    buttonLeftLimit: 2
  })

  const emit = defineEmits<{
    (e: 'update:filter', filter: Record<string, FilterVo>): void
    (e: 'reset'): void
    (e: 'search'): void
  }>()

  const isShow = ref(false)

  const useFormItemArr = computed(() => {
    const isshowLess = !props.isExpand && !isShow.value
    if (isshowLess) {
      const num = Math.floor(24 / props.elColSpan) - 1
      return props.items.slice(0, num)
    } else {
      return props.items
    }
  })

  const filter = computed({
    get: () => props.filter,
    set: (val) => emit('update:filter', val)
  })

  const getComponent = (type: SearchComponentType): any => {
    const componentsMap: Record<string, any> = {
      input: ArtSearchInput,
      select: ArtSearchSelect,
      radio: ArtSearchRadio,
      datetime: ArtSearchDate,
      date: ArtSearchDate,
      daterange: ArtSearchDate,
      datetimerange: ArtSearchDate,
      month: ArtSearchDate,
      monthrange: ArtSearchDate,
      year: ArtSearchDate,
      yearrange: ArtSearchDate,
      week: ArtSearchDate
    }
    return componentsMap[type]
  }
</script>

<style lang="scss" scoped>
  .search-bar {
    padding: 20px 20px 0;
    background-color: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) / 2 + 2px);

    :deep(.el-form-item__label) {
      display: flex;
      align-items: center;
      line-height: 20px;
    }

    .search-form-row {
      display: flex;
      flex-wrap: wrap;
    }

    .action-column {
      flex: 1;
      max-width: 100%;

      .action-buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 12px;
      }

      .filter-toggle {
        display: flex;
        align-items: center;
        margin-left: 10px;
        line-height: 32px;
        color: var(--main-color);
        cursor: pointer;

        span {
          font-size: 14px;
          user-select: none;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          margin-left: 4px;
          font-size: 14px;
        }
      }
    }
  }
</style>
