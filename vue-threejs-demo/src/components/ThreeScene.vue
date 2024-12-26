<template>
  <div id="three-container">
    <canvas ref="threeCanvas"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";

export default {
  name: "ThreeScene",
  mounted() {
    this.initThree();
  },
  methods: {
    initThree() {
      const canvas = this.$refs.threeCanvas;

      // 初始化场景、相机和渲染器
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas });
      renderer.setSize(window.innerWidth, window.innerHeight);

      // 创建一个立方体
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // 动画循环
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }

      animate();
    },
  },
};
</script>

<style scoped>
#three-container {
  width: 100%;
  height: 100vh;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
