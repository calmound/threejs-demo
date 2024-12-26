<template>
  <div id="app">
    <ThreeScene />
  </div>
</template>

<script>
import ThreeScene from "./components/ThreeScene.vue";

export default {
  name: "App",
  components: {
    ThreeScene,
  },
};
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
