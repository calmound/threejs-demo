<!-- Vue 3 应用程序的主组件 -->
<script setup>
// 导入 HelloWorld 组件，这是一个自定义的 Vue 组件
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <!-- 页面主容器，包含两个外部链接的 Logo -->
  <div>
    <!-- Vite 官网链接和 Logo -->
    <a href="https://vite.dev" target="_blank">
      <!-- Vite Logo，点击可跳转到官网 -->
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>

    <!-- Vue 官网链接和 Logo -->
    <a href="https://vuejs.org/" target="_blank">
      <!-- Vue Logo，点击可跳转到官网 -->
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>

  <!-- 引入 HelloWorld 组件，并传递 msg 属性 -->
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
/* Logo 样式定义 */
.logo {
  height: 6em; /* 设置 Logo 高度为 6em */
  padding: 1.5em; /* 设置 Logo 内边距 */
  will-change: filter; /* 提示浏览器 Logo 将发生滤镜变化 */
  transition: filter 300ms; /* 定义滤镜变化的过渡效果 */
}

/* Vite Logo 悬停效果 */
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa); /* 添加紫色阴影效果 */
}

/* Vue Logo 悬停效果 */
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa); /* 添加绿色阴影效果 */
}
</style>
