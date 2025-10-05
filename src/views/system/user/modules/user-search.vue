<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  // 动态 options
  const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

  // 模拟接口返回状态数据
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: t('pages.user.status.online'), value: '1' },
          { label: t('pages.user.status.offline'), value: '2' },
          { label: t('pages.user.status.abnormal'), value: '3' },
          { label: t('pages.user.status.canceled'), value: '4' }
        ])
      }, 1000)
    })
  }

  onMounted(async () => {
    statusOptions.value = await fetchStatusOptions()
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: t('pages.user.username'),
      key: 'userName',
      type: 'input',
      placeholder: t('pages.user.placeholder.username'),
      clearable: true
    },
    {
      label: t('pages.user.phone'),
      key: 'userPhone',
      type: 'input',
      props: { placeholder: t('pages.user.placeholder.phone'), maxlength: '11' }
    },
    {
      label: t('pages.user.email'),
      key: 'userEmail',
      type: 'input',
      props: { placeholder: t('pages.user.placeholder.email') }
    },
    {
      label: t('pages.user.accountStatus'),
      key: 'status',
      type: 'select',
      props: {
        placeholder: t('pages.user.placeholder.status'),
        options: statusOptions.value
      }
    },
    {
      label: t('pages.user.gender'),
      key: 'userGender',
      type: 'radiogroup',
      props: {
        options: [
          { label: t('pages.user.genderMale'), value: '1' },
          { label: t('pages.user.genderFemale'), value: '2' }
        ]
      }
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
