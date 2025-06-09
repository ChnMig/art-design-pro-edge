<template>
  <ElDialog
    v-model="dialogVisible"
    title="修改个人信息"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <ElForm
      :model="userForm"
      :rules="rules"
      ref="userFormRef"
      label-width="80px"
      status-icon
      @submit.prevent
    >
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="userForm.username" />
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
        <ElButton type="primary" @click="handleSubmit" :loading="loading"> 确认 </ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { mittBus } from '@/utils/sys'
  import { getUserInfo, updateUserInfo } from '@/api/system/api'
  import type { FormInstance } from 'element-plus'

  const dialogVisible = ref(false)
  const loading = ref(false)
  const userFormRef = ref<FormInstance>()
  const userForm = reactive({
    id: 0,
    username: '',
    password: '',
    phone: '',
    gender: 1
  })

  const rules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
  })

  onMounted(() => {
    mittBus.on('openEditInfoDialog', openDialog)
  })

  onBeforeUnmount(() => {
    mittBus.off('openEditInfoDialog', openDialog)
  })

  const openDialog = async () => {
    dialogVisible.value = true
    await getUserData()
  }

  const getUserData = async () => {
    try {
      const res = await getUserInfo()
      if (res.data.code === 0) {
        const userData = res.data.data
        userForm.id = userData.id
        userForm.username = userData.username
        userForm.phone = userData.phone || ''
        userForm.gender = userData.gender || 1
        // 密码默认为空，不显示
        userForm.password = ''
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
      ElMessage.error('获取用户信息失败')
    }
  }

  const handleSubmit = async () => {
    if (!userFormRef.value) return

    await userFormRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          const data = { ...userForm }
          // 如果密码为空，则不提交密码字段
          if (!data.password) {
            delete data.password
          }
          const res = await updateUserInfo(data)
          if (res.data.code === 0) {
            ElMessage.success('个人信息修改成功')
            dialogVisible.value = false
          } else {
            ElMessage.error(res.data.message || '修改失败')
          }
        } catch (error) {
          console.error('修改个人信息失败', error)
          ElMessage.error('修改个人信息失败')
        } finally {
          loading.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
