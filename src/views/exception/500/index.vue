<template>
  <ArtException
    :data="{
      title: '500',
      desc: '抱歉，服务器出错了',
      btnText: '返回首页',
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/state/500.png'
  defineOptions({ name: '500' })
</script>
