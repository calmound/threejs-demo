import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createNoise2D } from "simplex-noise";

// 清除现有的HTML内容
document.body.innerHTML = "";

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // 黑色背景

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(50, 80, 60);
camera.lookAt(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 创建渐变纹理
const createGradientTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;

  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, "#ff1493"); // 深粉色
  gradient.addColorStop(0.5, "#ff69b4"); // 亮粉色
  gradient.addColorStop(1, "#ff00ff"); // 紫色

  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// 创建地形
const geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
geometry.rotateX(Math.PI / 2);

// 创建材质
const material = new THREE.MeshPhongMaterial({
  color: 0xff1493, // 基础颜色为粉色
  wireframe: true, // 显示线框
  emissive: 0x330033, // 发光颜色
  shininess: 80, // 高光
  specular: 0xff00ff, // 镜面反射颜色
  wireframeLinewidth: 1, // 线框宽度
});

const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff1493, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 添加点光源来增强视觉效果
const pointLight = new THREE.PointLight(0xff00ff, 1, 200);
pointLight.position.set(0, 50, 0);
scene.add(pointLight);

// 创建噪声生成器
const noise2D = createNoise2D();

// 更新地形的函数
function updateTerrain(time) {
  const positions = terrain.geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);

    const originalX = vertex.x;
    const originalZ = vertex.z;

    // 使用多层噪声
    const scale1 = 0.02;
    const scale2 = 0.04;

    const noise1 = noise2D(originalX * scale1, originalZ * scale1) * 1.0;
    const noise2 = noise2D(originalX * scale2, originalZ * scale2) * 0.5;

    // 合并噪声并添加正弦波以创造波浪效果
    const timeScale = 0.0005;
    const waveHeight = Math.sin(time * timeScale + originalX * 0.05) * 5;
    const combinedNoise = (noise1 + noise2) * 15 + waveHeight;

    // 设置Y轴位移
    positions.setY(i, combinedNoise);
  }

  positions.needsUpdate = true;
  terrain.geometry.computeVertexNormals();
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新地形
  updateTerrain(performance.now());

  // 更新控制器
  controls.update();

  // 渲染场景
  renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 开始动画
animate();
