<template>
  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="700px"
    align-center
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="85px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单标题" prop="title">
            <el-input v-model="form.title" placeholder="菜单标题"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="form.path" placeholder="路由地址"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="页面类型">
            <el-radio-group v-model="form.type">
              <el-radio-button value="internal">内部组件</el-radio-button>
              <el-radio-button value="link">外部链接</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组件路径" prop="component" v-if="form.type === 'internal'" required>
            <el-input v-model="form.component" placeholder="组件路径"></el-input>
          </el-form-item>
          <el-form-item label="外部链接" prop="link" v-else-if="form.type === 'link'" required>
            <el-input
              v-model="form.link"
              placeholder="外部链接地址 (https://www.example.com)"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单标识" prop="name">
            <el-input v-model="form.name" placeholder="菜单标识"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图标" prop="icon">
            <ArtIconSelector
              v-model="form.icon"
              :iconType="iconType"
              :defaultIcon="form.icon"
              width="229px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单排序" prop="sort" style="width: 100%">
            <el-input-number
              v-model="form.sort"
              style="width: 100%"
              @change="handleChange"
              :min="1"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="启用" prop="isEnable">
            <el-switch v-model="form.isEnable"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="页面缓存" prop="keepAlive">
            <el-switch v-model="form.keepAlive"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="菜单隐藏" prop="isHide">
            <el-switch v-model="form.isHide"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="标签页隐藏" prop="isHideTab">
            <el-switch v-model="form.isHideTab"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="iframe" prop="isIframe">
            <el-switch v-model="form.isIframe"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="一级主页" prop="isInMainContainer">
            <el-switch v-model="form.isInMainContainer"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm()"> 确 定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, nextTick, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { addMenu, updateMenu } from '@/api/system/api'
  import { ApiStatus } from '@/api/status'
  const dialogVisible = ref(false)
  const form = reactive({
    // 菜单
    id: 0,
    name: '',
    path: '',
    isHide: false,
    isHideTab: false,
    isInMainContainer: false,
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
          form.isInMainContainer = row.meta.isInMainContainer
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
          formData.isInMainContainer = form.isInMainContainer ? 1 : 2
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
          formData.isInMainContainer = form.isInMainContainer ? 1 : 2
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
</script>
