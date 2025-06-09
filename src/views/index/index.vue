<template>
  <ArtLayouts>
    <!-- 顶栏、水平/混合菜单 -->
    <ArtHeaderBar />
    <!-- 左侧/双列菜单 -->
    <ArtSidebarMenu />
    <!-- 页面内容 -->
    <ArtPageContent />
    <!-- 设置面板 -->
    <ArtSettingsPanel />
    <!-- 全局搜索 -->
    <ArtGlobalSearch />
    <!-- 屏幕锁定 -->
    <ArtScreenLock />
    <!-- 编辑信息组件 -->
    <EditInfo />
    <!-- 水印效果 -->
    <ArtWatermark />
  </ArtLayouts>
</template>

<style lang="scss" scoped>
  @use './style';
</style>
