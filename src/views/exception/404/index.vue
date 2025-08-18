<template>
  <ArtException
    :data="{
      title: '404',
      desc: '抱歉，你访问的页面不存在',
      btnText: '返回首页',
      imgUrl
    }"
  />
</template>

<script setup lang="ts">
  import imgUrl from '@imgs/svg/404.svg'
  defineOptions({ name: 'Exception404' })
</script>
