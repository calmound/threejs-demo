// 导入必要的库
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // 黑色背景

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // 视野角度
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近平面
  1000 // 远平面
);
camera.position.set(0, 0, 50); // 设置相机位置

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true // 抗锯齿
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 设置像素比

// 添加轨道控制器，使用户可以旋转和缩放场景
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 启用阻尼效果，使控制器更平滑
controls.dampingFactor = 0.05;

// 创建心形线条几何体
const geometry = new MeshLineGeometry();

// 生成心形曲线的点
const geometryPoints = [];
for (let t = 0; t <= Math.PI * 2; t += 0.01) {
  // 心形曲线的数学公式
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  geometryPoints.push(new THREE.Vector3(x, y, 0));
}

// 设置几何体的点，并使线条从粗到细
geometry.setPoints(geometryPoints, (p) => 1 - p * 0.5);

// 创建线条材质
const lineMaterial = new MeshLineMaterial({
  color: new THREE.Color(0xff0066), // 粉红色
  lineWidth: 1.5, // 线条宽度
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight), // 分辨率
  dashArray: 2, // 虚线数组值，控制虚线的长度
  dashOffset: 0, // 虚线偏移量，用于动画
  dashRatio: 0.5, // 虚线比例，控制实线和虚线的比例
});

// 设置材质属性，使虚线部分透明，并解决深度测试问题
lineMaterial.transparent = true; // 启用透明
lineMaterial.depthTest = false; // 禁用深度测试，防止线条被自身遮挡

// 创建网格并添加到场景
const mesh = new THREE.Mesh(geometry, lineMaterial);
scene.add(mesh);

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 添加方向光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 处理窗口大小变化
window.addEventListener('resize', () => {
  // 更新相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // 更新渲染器大小
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // 更新线条材质的分辨率
  lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  // 更新控制器
  controls.update();
  
  // 旋转心形线条
  mesh.rotation.z += 0.005;
  
  // 更新虚线偏移量，创建动画效果
  lineMaterial.dashOffset -= 0.01;
  
  // 渲染场景
  renderer.render(scene, camera);
}

// 启动动画循环
animate();

// 添加一些额外的视觉效果
// 创建星星背景
function addStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
  });

  const starsVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starsVertices, 3)
  );

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

// 添加星星
addStars();
