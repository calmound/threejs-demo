import * as THREE from "three";
import { EffectComposer, RenderPass } from "postprocessing";
import { GodraysPass } from "three-good-godrays";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

// ===== 基础场景设置 =====

// 创建渲染器 - 支持抗锯齿和阴影
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // 启用阴影渲染
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用PCF软阴影，效果更自然
document.body.appendChild(renderer.domElement);

// 创建场景和相机
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // 黑色背景增强光束效果对比度

// 创建透视相机 - 参数：视场角、宽高比、近裁剪面、远裁剪面
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(5, 4, 15); // 设置相机位置
camera.lookAt(0, 4, -2); // 设置相机观察点，朝向光束区域

// ===== 光源设置 =====

// 添加平行光源 - 模拟从窗户照射进来的阳光
const light = new THREE.DirectionalLight(0xffffff, 2); // 白色光，强度为2
light.position.set(0, 12, -10); // 光源位置 - 从高处向下照射
light.target.position.set(0, 4, 0); // 光源目标点 - 控制光照方向
light.castShadow = true; // 启用阴影投射
scene.add(light);
scene.add(light.target); // 必须将目标添加到场景中才能生效

// 设置阴影参数 - 提高阴影质量
light.shadow.mapSize.set(2048, 2048); // 阴影贴图分辨率，值越大阴影越清晰
light.shadow.camera.near = 0.5; // 阴影相机近裁剪面
light.shadow.camera.far = 50; // 阴影相机远裁剪面

// ===== 场景物体 =====

// 创建窗户框架 - 定义光束形状的边界
const frameGeometry = new THREE.BoxGeometry(10, 10, 1);
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // 灰色材质
const frame = new THREE.Mesh(frameGeometry, frameMaterial);
frame.position.set(0, 5, -6); // 窗户位置
frame.castShadow = true; // 投射阴影
scene.add(frame);

// 创建窗户栏杆 - 用于切割光束，产生条纹效果
const bars = [];
for (let i = -3; i <= 3; i += 1.5) { // 在窗户上均匀分布多个栏杆
  const barGeometry = new THREE.BoxGeometry(0.6, 8, 1); // 细长的栏杆
  const barMesh = new THREE.Mesh(barGeometry, frameMaterial);
  barMesh.position.set(i, 4, -6); // 栏杆位置
  barMesh.castShadow = true; // 投射阴影
  scene.add(barMesh);
  bars.push(barMesh); // 保存栏杆引用，便于后续可能的动画或交互
}

// 添加地面 - 用于接收光束和阴影
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 }); // 深灰色
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // 水平放置
floor.position.y = -1; // 位于场景底部
floor.receiveShadow = true; // 接收阴影
scene.add(floor);

// 添加墙壁 - 增强光束对比度和空间感
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 }); // 暗色墙壁

// 后墙
const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), wallMaterial);
wallBack.position.set(0, 5, -10); // 位于窗户后方
scene.add(wallBack);

// 左墙
const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), wallMaterial);
wallLeft.position.set(-10, 5, 0);
wallLeft.rotation.y = Math.PI / 2; // 垂直于后墙
scene.add(wallLeft);

// ===== 后期处理效果 =====

// 设置后期处理合成器
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera); // 基础渲染通道
composer.addPass(renderPass);

// Godrays（体积光）参数设置 - 可通过GUI实时调整
let params = {
  density: 0.01, // 控制光束密度 - 值越大，光束越明显
  gammaCorrection: true, // 伽马校正 - 使光线亮度分布更符合人眼感知
};

// 创建体积光通道(GodraysPass) - 产生光束穿过窗户的效果
let godraysPass = new GodraysPass(light, camera, {
  density: params.density,
  gammaCorrection: params.gammaCorrection,
});
godraysPass.renderToScreen = true; // 将结果直接渲染到屏幕
composer.addPass(godraysPass);

// ===== 用户界面控制 =====

// GUI 控制面板 - 允许用户调整光束效果
const gui = new GUI();
gui.add(params, "density", 0.0001, 0.02, 0.0001).onChange(updateGodrays); // 密度滑块
gui.add(params, "gammaCorrection").onChange(updateGodrays); // 伽马校正开关

// 当参数变化时，重新创建 GodraysPass
function updateGodrays() {
  composer.removePass(godraysPass); // 移除旧的通道
  godraysPass = new GodraysPass(light, camera, {
    density: params.density,
    gammaCorrection: params.gammaCorrection,
  });
  godraysPass.renderToScreen = true;
  composer.addPass(godraysPass); // 添加新的通道
}

// ===== 动画与交互 =====

// 动画循环 - 持续渲染场景
function animate() {
  requestAnimationFrame(animate);
  composer.render(); // 使用后期处理合成器渲染
}

animate();

// 窗口大小自适应 - 确保在窗口调整大小时保持正确比例
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
