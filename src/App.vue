<template>
  <div id="app">
    <!-- 路由出口，页面内容将在这里渲染 -->
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
#app {
  /* 设计稿尺寸，例如 iPhone 13 的 390x844 */
  width: 390px;
  height: 844px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 背景色或背景图填充屏幕多余部分 */
  background: #EBEBEB;
}

/* 防止内容超出 */
#app > * {
  overflow: hidden;
}
</style>
