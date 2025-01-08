import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import "./style.css";

// 场景设置
const canvas = document.getElementById("myCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 创建多个发光立方体
const cubes = [];
const colors = [
  { color: 0x00ff00, intensity: 1.5 }, // 绿色
  { color: 0x0000ff, intensity: 15 }, // 蓝色，进一步增加发光强度
  { color: 0xffff00, intensity: 2.5 }, // 黄色
];

colors.forEach((colorInfo, index) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    // 使用 BasicMaterial 确保发光
    color: colorInfo.color,
  });
  const emissiveMaterial = new THREE.MeshStandardMaterial({
    color: colorInfo.color,
    emissive: colorInfo.color,
    emissiveIntensity: colorInfo.intensity,
    transparent: true,
    opacity: 0.8,
  });

  const cube = new THREE.Mesh(geometry, [
    material,
    material,
    material,
    material,
    emissiveMaterial, // 仅使用发光材质作为立方体的一个面
    material,
  ]);

  // 将立方体均匀分布在屏幕上，增加间距
  const totalCubes = colors.length;
  cube.position.x = ((index - (totalCubes - 1) / 2) * 5); // 增加间距从 2.5 到 5
  cube.position.z = -5;

  scene.add(cube);
  cubes.push(cube);
});

// 添加环境光和点光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// 设置相机位置
camera.position.z = 5;

// 后期处理 - EffectComposer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 添加 UnrealBloomPass 实现发光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  3.0, // 更高的强度
  0.4,
  0.85
);
composer.addPass(bloomPass);

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 旋转立方体
  cubes.forEach((cube, index) => {
    cube.rotation.x += 0.01 * (index + 1);
    cube.rotation.y += 0.01 * (index + 1);
  });

  // 使用 composer 渲染
  composer.render();
}

// 响应窗口大小变化
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
});

animate();
