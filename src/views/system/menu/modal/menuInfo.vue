<template>
  <ElDialog v-model="dialogVisible" width="700px" align-center :close-on-click-modal="false">
    <template #header>
      <div class="dialog-title-with-help">
        <span>{{ dialogTitle }}</span>
        <ElTooltip effect="dark" :content="helpContent" placement="top">
          <ElIcon class="help-icon" @click="showHelp"><QuestionFilled /></ElIcon>
        </ElTooltip>
      </div>
    </template>
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="85px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="菜单标题" prop="title">
            <ElInput v-model="form.title" placeholder="菜单标题"></ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="路由地址" prop="path">
            <ElInput v-model="form.path" placeholder="路由地址"></ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="页面类型">
            <ElRadioGroup v-model="form.type">
              <ElRadioButton value="internal">内部组件</ElRadioButton>
              <ElRadioButton value="link">外部链接</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="组件路径" prop="component" v-if="form.type === 'internal'" required>
            <ElInput v-model="form.component" placeholder="组件路径"></ElInput>
          </ElFormItem>
          <ElFormItem label="外部链接" prop="link" v-else-if="form.type === 'link'" required>
            <ElInput
              v-model="form.link"
              placeholder="外部链接地址 (https://www.example.com)"
            ></ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="菜单标识" prop="name">
            <ElInput v-model="form.name" placeholder="菜单标识"></ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="图标" prop="icon">
            <ArtIconSelector
              v-model="form.icon"
              :iconType="iconType"
              :defaultIcon="form.icon"
              width="229px"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="菜单排序" prop="sort" style="width: 100%">
            <ElInputNumber
              v-model="form.sort"
              style="width: 100%"
              @change="handleChange"
              :min="1"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElFormItem label="启用" prop="isEnable">
            <ElSwitch v-model="form.isEnable"></ElSwitch>
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="页面缓存" prop="keepAlive">
            <ElSwitch v-model="form.keepAlive"></ElSwitch>
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="菜单隐藏" prop="isHide">
            <ElSwitch v-model="form.isHide"></ElSwitch>
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="标签页隐藏" prop="isHideTab">
            <ElSwitch v-model="form.isHideTab"></ElSwitch>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElFormItem label="iframe" prop="isIframe">
            <ElSwitch v-model="form.isIframe"></ElSwitch>
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="一级主页" prop="isFirstLevel">
            <ElSwitch v-model="form.isFirstLevel"></ElSwitch>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取 消</ElButton>
        <ElButton type="primary" @click="submitForm()"> 确 定 </ElButton>
      </span>
    </template>
  </ElDialog>

  <!-- 帮助弹窗 -->
  <ElDialog v-model="helpDialogVisible" title="菜单配置帮助" width="600px" append-to-body>
    <div class="help-content">
      <p>没有实际页面的节点菜单,确保将组件路径填成 /index/index</p>
      <p>有实际页面的菜单, 确保精确到 .vue 文件, 例如: /index/index</p>
      <p>一级节点,确保路由地址前缀带 / , 例如 /dashboard</p>
      <p>菜单标识不要重复</p>
      <p
        >如果是单独的跳转页面, 不希望在菜单中展示, 请放置到 隐藏页面 子菜单中, 然后勾选 菜单隐藏
        属性</p
      >
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, nextTick, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { addMenu, updateMenu } from '@/api/system/api'
  import { ApiStatus } from '@/utils/http/status'
  import { QuestionFilled } from '@element-plus/icons-vue'

  const dialogVisible = ref(false)
  const helpDialogVisible = ref(false)
  const helpContent = ref('点击查看帮助')
  const form = reactive({
    // 菜单
    id: 0,
    name: '',
    path: '',
    isHide: false,
    isHideTab: false,
    isFirstLevel: false,
    title: '',
    type: 'internal',
    component: '',
    icon: '',
    isEnable: true,
    sort: 1,
    keepAlive: true,
    link: '',
    isIframe: false,
    parentId: 0
  })
  const iconType = ref(IconTypeEnum.UNICODE)
  const isEdit = ref(false)
  const lockMenuType = ref(false)
  const formRef = ref<FormInstance>()
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入菜单标识', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    title: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    component: [
      {
        required: true,
        message: '请输入组件路径',
        trigger: 'blur',
        validator: (rule, value, callback) => {
          if (form.type === 'internal' && !value) {
            callback(new Error('请输入组件路径'))
          } else {
            callback()
          }
        }
      }
    ],
    link: [
      {
        required: true,
        message: '请输入外部链接',
        trigger: 'blur',
        validator: (rule, value, callback) => {
          if (form.type === 'link' && !value) {
            callback(new Error('请输入外部链接'))
          } else {
            callback()
          }
        }
      }
    ],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限权限标识', trigger: 'blur' }]
  })
  const dialogTitle = computed(() => {
    const type = '菜单'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })
  const handleChange = () => {}
  const showModal = (type: string, row?: any, lock: boolean = false) => {
    dialogVisible.value = true
    isEdit.value = false
    lockMenuType.value = lock
    resetForm()
    if (row) {
      nextTick(() => {
        // 新增一级菜单
        if (type === 'add-menu-levle1') {
          form.parentId = 0
        } else if (type === 'add-menu-levle2') {
          // 新增二级菜单
          form.parentId = row.id
        } else {
          // 编辑
          // 菜单数据回显
          form.id = row.id
          form.name = row.name
          form.path = row.path
          form.title = row.meta.title
          form.icon = row.meta.icon
          form.sort = row.meta.sort
          form.keepAlive = row.meta.keepAlive
          form.isEnable = row.meta.isEnable
          form.link = row.meta.link
          form.isIframe = row.meta.isIframe
          form.isHide = row.meta.isHide
          form.isHideTab = row.meta.isHideTab
          form.isFirstLevel = row.meta.isFirstLevel
          form.component = row.component
          form.parentId = row.parentId
          if (row.component) {
            form.type = 'internal'
            form.component = row.component
          } else {
            form.type = 'link'
            form.link = row.meta.link
          }
          isEdit.value = true
        }
      })
    }
  }
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      // 菜单
      name: '',
      path: '',
      icon: '',
      sort: 1,
      keepAlive: true,
      link: '',
      isIframe: false
    })
  }
  const submitForm = async () => {
    if (!formRef.value) return
    // 根据当前类型决定需要验证的字段
    const fieldsToValidate = ['name', 'path']
    if (form.type === 'internal') {
      fieldsToValidate.push('component')
    } else if (form.type === 'link') {
      fieldsToValidate.push('link')
    }
    // 先验证指定的字段
    formRef.value.validateField(fieldsToValidate, async (valid) => {
      console.log('edit', isEdit.value)
      if (!valid) return
      try {
        if (isEdit.value) {
          const formData = { ...form }
          formData.status = form.isEnable ? 1 : 2
          formData.keepAlive = form.keepAlive ? 1 : 2
          formData.isHide = form.isHide ? 1 : 2
          formData.isHideTab = form.isHideTab ? 1 : 2
          formData.isIframe = form.isIframe ? 1 : 2
          formData.isFirstLevel = form.isFirstLevel ? 1 : 2
          const res = await updateMenu(formData)
          if (res.code === ApiStatus.success) {
            ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
            dialogVisible.value = false
            // 触发父组件刷新列表
            emit('refresh')
          } else {
            ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败: ${res.message}`)
            console.log('更新菜单失败', res.message)
          }
        } else {
          const formData = { ...form }
          formData.status = form.isEnable ? 1 : 2
          formData.keepAlive = form.keepAlive ? 1 : 2
          formData.isHide = form.isHide ? 1 : 2
          formData.isHideTab = form.isHideTab ? 1 : 2
          formData.isIframe = form.isIframe ? 1 : 2
          formData.isFirstLevel = form.isFirstLevel ? 1 : 2
          const res = await addMenu(formData)
          if (res.code === ApiStatus.success) {
            ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
            dialogVisible.value = false
            // 触发父组件刷新列表
            emit('refresh')
          } else {
            ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败: ${res.message}`)
            console.log('新增菜单失败', res.message)
          }
        }
        dialogVisible.value = false
      } catch {
        ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败`)
      }
    })
  }
  // 对外暴露方法
  defineExpose({
    showModal
  })
  // 定义事件
  const emit = defineEmits(['refresh'])
  // 添加一个监听器来处理类型变化时的表单重新验证
  watch(
    () => form.type,
    (newType) => {
      // 清空另一个字段的值
      if (newType === 'internal') {
        form.link = ''
        // 不再主动触发验证，只清除验证状态
        nextTick(() => {
          formRef.value?.clearValidate(['link', 'component'])
        })
      } else if (newType === 'link') {
        form.component = ''
        // 不再主动触发验证，只清除验证状态
        nextTick(() => {
          formRef.value?.clearValidate(['link', 'component'])
        })
      }
    }
  )
  const showHelp = () => {
    helpDialogVisible.value = true
  }
</script>

<style lang="scss" scoped>
  .dialog-title-with-help {
    display: flex;
    align-items: center;

    .help-icon {
      margin-left: 8px;
      font-size: 16px;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }

  .help-content {
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: bold;
    }

    p {
      margin: 8px 0;
      line-height: 1.6;
    }

    ul {
      padding-left: 20px;

      li {
        margin-bottom: 4px;
      }
    }
  }
</style>
