<template>
  <ArtException
    :data="{
      title: '403',
      desc: '抱歉，你无权访问该页面',
      btnText: '返回首页',
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/state/403.png'
  defineOptions({ name: '403' })
</script>
