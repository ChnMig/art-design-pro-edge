<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? t('pages.user.add') : t('pages.user.edit')"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem :label="t('pages.user.username')" prop="username">
        <ElInput v-model="formData.username" />
      </ElFormItem>
      <ElFormItem :label="t('pages.user.phone')" prop="phone">
        <ElInput v-model="formData.phone" />
      </ElFormItem>
      <ElFormItem :label="t('pages.user.gender')" prop="gender">
        <ElSelect v-model="formData.gender">
          <ElOption :label="t('pages.user.genderMale')" value="男" />
          <ElOption :label="t('pages.user.genderFemale')" value="女" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('pages.user.role')" prop="role">
        <ElSelect v-model="formData.role" multiple>
          <ElOption
            v-for="role in roleList"
            :key="role.roleCode"
            :value="role.roleCode"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">
          {{ t('common.submit') || t('common.confirm') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ROLE_LIST_DATA } from '@/mock/temp/formData'
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref(ROLE_LIST_DATA)
  const { t } = useI18n()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    username: '',
    phone: '',
    gender: '男',
    role: [] as string[]
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: t('pages.user.rules.usernameRequired'), trigger: 'blur' },
      { min: 2, max: 20, message: t('pages.user.rules.usernameLength'), trigger: 'blur' }
    ],
    phone: [
      { required: true, message: t('pages.user.rules.phoneRequired'), trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: t('pages.user.rules.phoneFormat'), trigger: 'blur' }
    ],
    gender: [{ required: true, message: t('pages.user.rules.genderRequired'), trigger: 'blur' }],
    role: [{ required: true, message: t('pages.user.rules.roleRequired'), trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      username: isEdit ? row.userName || '' : '',
      phone: isEdit ? row.userPhone || '' : '',
      gender: isEdit ? row.userGender || '男' : '男',
      role: isEdit ? (Array.isArray(row.userRoles) ? row.userRoles : []) : []
    })
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        ElMessage.success(
          dialogType.value === 'add' ? t('pages.user.success.add') : t('pages.user.success.edit')
        )
        dialogVisible.value = false
        emit('submit')
      }
    })
  }
</script>
