<template>
  <div class="galaxy-container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref(null);
let scene, camera, renderer, controls;
let particles;
const parameters = {
  count: 150000,
  size: 0.015,
  radius: 12,
  branches: 4,
  spin: 0.6,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff9d00",
  outsideColor: "#4c6bba",
};

const init = () => {
  // Scene setup
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#000000", 2, 25);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, -5, 0);
  camera.lookAt(0, 1, 0);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor("#000000");
  container.value.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.minPolarAngle = 0;
  controls.enableZoom = true;
  controls.minDistance = 0.1;
  controls.maxDistance = 15;

  // Generate galaxy
  generateGalaxy();

  // Animation
  animate();
};

const generateGalaxy = () => {
  // Dispose of old particles
  if (particles !== undefined) {
    particles.geometry.dispose();
    particles.material.dispose();
    scene.remove(particles);
  }

  // Geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      0.15;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      0.15;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      radius *
      0.15;

    // 创建一个更平缓的弧形银河带
    const theta = branchAngle + spinAngle;
    const y = Math.sin(theta) * radius * 0.3;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    positions[i3] = x + randomX;
    positions[i3 + 1] = y + randomY + 6;
    positions[i3 + 2] = z + randomZ;

    // Color with enhanced brightness
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    const brightness = 1.2 + Math.random() * 0.5;
    mixedColor.multiplyScalar(brightness);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Random star size with bigger variation
    scales[i] = Math.random() * 3 + 1;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  // Material
  const material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
  });

  // Points
  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 添加更明亮的背景星星
  const backgroundStars = new THREE.BufferGeometry();
  const bgStarPositions = new Float32Array(80000 * 3);
  const bgStarColors = new Float32Array(80000 * 3);

  for (let i = 0; i < 80000; i++) {
    const i3 = i * 3;
    const radius = 18;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    bgStarPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    bgStarPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    bgStarPositions[i3 + 2] = radius * Math.cos(phi);

    const starColor = new THREE.Color();
    const hue = Math.random();
    const saturation = Math.random() * 0.5 + 0.5;
    const lightness = Math.random() * 0.3 + 0.7;
    starColor.setHSL(hue, saturation, lightness);

    bgStarColors[i3] = starColor.r;
    bgStarColors[i3 + 1] = starColor.g;
    bgStarColors[i3 + 2] = starColor.b;
  }

  backgroundStars.setAttribute(
    "position",
    new THREE.BufferAttribute(bgStarPositions, 3)
  );
  backgroundStars.setAttribute(
    "color",
    new THREE.BufferAttribute(bgStarColors, 3)
  );

  const bgStarsMaterial = new THREE.PointsMaterial({
    size: 0.005,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const backgroundStarsPoints = new THREE.Points(
    backgroundStars,
    bgStarsMaterial
  );
  scene.add(backgroundStarsPoints);
};

const animate = () => {
  requestAnimationFrame(animate);

  controls.update();

  if (particles) {
    particles.rotation.y += 0.0005;
  }

  renderer.render(scene, camera);
};

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  init();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<style scoped>
.galaxy-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
  background: #000;
}
</style>
