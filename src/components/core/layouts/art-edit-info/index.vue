<template>
  <ElDialog
    v-model="dialogVisible"
    title="修改个人信息"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <ElForm
      ref="userFormRef"
      :model="userForm"
      :rules="rules"
      label-width="80px"
      status-icon
      @submit.prevent
    >
      <ElFormItem label="用户名">
        <ElInput v-model="userForm.username" disabled />
      </ElFormItem>
      <ElFormItem label="姓名" prop="name">
        <ElInput v-model="userForm.name" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password">
        <ElInput
          v-model="userForm.password"
          type="password"
          placeholder="不填则不修改密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="userForm.phone" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElRadioGroup v-model="userForm.gender">
          <ElRadio :label="1">男</ElRadio>
          <ElRadio :label="2">女</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="loading">确认</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchGetUserInfo, fetchUpdateUserInfo } from '@/api/auth'
  import { useUserStore } from '@/store/modules/user'
  import { mittBus } from '@/utils/sys'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'ArtEditInfoDialog' })

  interface EditInfoForm {
    id: number | string
    username: string
    name: string
    password: string
    phone: string
    gender: number
  }

  const dialogVisible = ref(false)
  const loading = ref(false)
  const userFormRef = ref<FormInstance>()
  const userForm = reactive<EditInfoForm>({
    id: 0,
    username: '',
    name: '',
    password: '',
    phone: '',
    gender: 1
  })

  const rules: FormRules<EditInfoForm> = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号',
        trigger: 'blur'
      }
    ]
  }

  const userStore = useUserStore()

  onMounted(() => {
    mittBus.on('openEditInfoDialog', openDialog)
  })

  onBeforeUnmount(() => {
    mittBus.off('openEditInfoDialog', openDialog)
  })

  const openDialog = async () => {
    dialogVisible.value = true
    await loadUserInfo()
  }

  const loadUserInfo = async () => {
    try {
      const data = await fetchGetUserInfo()
      if (data) {
        userForm.id = (data.userId ?? data.id ?? userForm.id) as number | string
        userForm.username = (data.username ||
          data.account ||
          data.userName ||
          data.nickName ||
          '') as string
        userForm.name = (data.name || data.nickName || userForm.username) as string
        userForm.phone = (data.phone || data.userPhone || '') as string
        userForm.gender = Number(data.gender ?? data.userGender ?? userForm.gender) as 1 | 2
        userForm.password = ''
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
      ElMessage.error('获取用户信息失败')
    }
  }

  const handleSubmit = async () => {
    if (!userFormRef.value) return

    try {
      await userFormRef.value.validate()
    } catch {
      return
    }

    loading.value = true
    try {
      const payload = {
        id: userForm.id,
        name: userForm.name,
        phone: userForm.phone || undefined,
        gender: userForm.gender,
        password: userForm.password || undefined
      }
      await fetchUpdateUserInfo(payload)
      ElMessage.success('个人信息修改成功')
      dialogVisible.value = false
      const latest = await fetchGetUserInfo()
      if (latest) {
        userStore.setUserInfo(latest)
      }
    } catch (error) {
      console.error('修改个人信息失败', error)
      ElMessage.error('修改个人信息失败')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
