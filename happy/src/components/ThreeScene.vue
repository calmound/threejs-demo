<template>
  <div ref="container" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { FireworksManager } from "../utils/fireworks";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

const container = ref(null);
let scene, camera, renderer, fireworksManager;
let textMesh;
let particleSystem, particleMaterial, particleGeometry;
let animationFrameId;
let particleColors;

const init = () => {
  // 初始化场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // 初始化相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 100);
  camera.lookAt(0, 0, 0);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value.appendChild(renderer.domElement);

  // 添加环境光和方向光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 初始化烟花效果
  fireworksManager = new FireworksManager(scene);

  // 添加3D文字
  addText();

  // 添加五颜六色的粒子效果
  addParticles();

  // 绑定窗口调整事件
  window.addEventListener("resize", onWindowResize);
};

const addText = () => {
  const loader = new FontLoader();
  loader.load("/fonts/FangSong_Regular.json", (font) => {
    const textGeometry = new TextGeometry("新年快乐", {
      font: font,
      size: 14,
      height: 3,
      curveSegments: 36,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.3,
      bevelSegments: 10,
    });

    const textMaterial = new THREE.MeshStandardMaterial({
      color: "rgb(255, 0, 0)", // 带有一点橘黄的红色
      roughness: 0.6,
      metalness: 0.5,
      emissive: "rgb(255, 76, 21)", // 移除自发光
    });

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.computeBoundingBox();
    const textWidth =
      textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.set(-textWidth / 2, 0, 0);
    scene.add(textMesh);
  });
};

const addParticles = () => {
  particleGeometry = new THREE.BufferGeometry();
  const particleCount = 1000;
  const positions = [];
  particleColors = [];

  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 200,
      Math.random() * 100,
      (Math.random() - 0.5) * 200
    );
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    particleColors.push(color.r, color.g, color.b);
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  particleGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(particleColors, 3)
  );

  particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true, // 启用顶点颜色
    transparent: true,
    opacity: 0.8,
  });

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // 增加烟花生成频率
  if (Math.random() < 0.08) {
    fireworksManager.addFirework();
  }

  // 更新烟花
  fireworksManager.update();

  // 字体轻微浮动
  if (textMesh) {
    textMesh.position.y = Math.sin(Date.now() * 0.002) * 2; // 上下浮动
  }

  // 粒子上升效果
  const positions = particleGeometry.attributes.position.array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] += 0.5; // 上升速度
    if (positions[i] > 100) {
      positions[i] = 0; // 重置到底部
    }
  }
  particleGeometry.attributes.position.needsUpdate = true;

  // 渲染场景
  renderer.render(scene, camera);
};

onMounted(() => {
  init();
  animate();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", onWindowResize);

  // 清理资源
  if (container.value) {
    container.value.removeChild(renderer.domElement);
  }
  scene.dispose();
  particleGeometry.dispose();
  particleMaterial.dispose();
  fireworksManager.dispose();
});
</script>

<style scoped>
.scene-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}
</style>
