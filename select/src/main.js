import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 创建效果合成器
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 创建轮廓线效果
const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
outlinePass.edgeStrength = 3; // 边缘强度
outlinePass.edgeGlow = 1; // 发光强度
outlinePass.edgeThickness = 1; // 边缘厚度
outlinePass.pulsePeriod = 0; // 脉冲周期
outlinePass.visibleEdgeColor.set("#ffffff"); // 可见边缘颜色
outlinePass.hiddenEdgeColor.set("#190a05"); // 被遮挡边缘颜色
composer.addPass(outlinePass);

// 创建几个不同的几何体
const geometries = [
  new THREE.BoxGeometry(),
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.ConeGeometry(0.5, 1, 32),
];

const materials = [
  new THREE.MeshPhongMaterial({ color: 0xff0000 }),
  new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
  new THREE.MeshPhongMaterial({ color: 0x0000ff }),
];

const meshes = [];

// 创建多个物体并随机分布
for (let i = 0; i < 3; i++) {
  const mesh = new THREE.Mesh(geometries[i], materials[i]);
  mesh.position.set(
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 4
  );
  scene.add(mesh);
  meshes.push(mesh);
}

// 添加灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 鼠标事件处理
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 更新射线投射器
  raycaster.setFromCamera(mouse, camera);

  // 计算物体和射线的焦点
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    // 选中第一个相交的物体
    outlinePass.selectedObjects = [intersects[0].object];
  } else {
    // 没有相交的物体，清空选中
    outlinePass.selectedObjects = [];
  }
}

// 窗口大小改变时更新渲染
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// 添加事件监听器
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("resize", onWindowResize);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

animate();
