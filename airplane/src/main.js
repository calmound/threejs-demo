import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Sky } from "three/examples/jsm/objects/Sky";
import { FogExp2 } from "three";

import "./style.css";

// 创建场景
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xdfe9f3, 0.02); // 添加雾效果

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // 启用阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用柔和阴影
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 添加电影级别的色调映射
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

// 添加天空
const sky = new Sky();
sky.scale.setScalar(1000);
scene.add(sky);

const sun = new THREE.Vector3();
const uniforms = sky.material.uniforms;
uniforms["turbidity"].value = 10;
uniforms["rayleigh"].value = 2;
uniforms["mieCoefficient"].value = 0.005;
uniforms["mieDirectionalG"].value = 0.8;

const phi = THREE.MathUtils.degToRad(90 - 2);
const theta = THREE.MathUtils.degToRad(180);
sun.setFromSphericalCoords(1, phi, theta);
uniforms["sunPosition"].value.copy(sun);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 50;
controls.minDistance = 3;

// 创建一个组来存放飞机模型
const airplane = new THREE.Group();
scene.add(airplane);

// 加载飞机模型
const loader = new GLTFLoader();
loader.load(
  "/airplane/scene.gltf",
  (gltf) => {
    // 调整模型大小和方向
    gltf.scene.scale.set(0.01, 0.01, 0.01);
    gltf.scene.rotation.set(0, Math.PI, 0);
    // 为模型添加阴影
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 增强材质效果
        if (child.material) {
          child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
        }
      }
    });
    airplane.add(gltf.scene);
  },
  (progress) => {
    console.log("加载进度:", (progress.loaded / progress.total) * 100 + "%");
  },
  (error) => {
    console.error("模型加载出错:", error);
  }
);

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 主光源
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 5, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.1;
mainLight.shadow.camera.far = 100;
mainLight.shadow.camera.left = -20;
mainLight.shadow.camera.right = 20;
mainLight.shadow.camera.top = 20;
mainLight.shadow.camera.bottom = -20;
scene.add(mainLight);

// 添加补光
const fillLight = new THREE.DirectionalLight(0x8088ff, 0.4);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// 创建飞行路径
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-10, 0, 0),
  new THREE.Vector3(-5, 4, 5),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(5, 4, -5),
  new THREE.Vector3(10, 0, 0),
]);

// 可视化路径（使用渐变材质）
const points = curve.getPoints(50);
const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
const pathMaterial = new THREE.LineDashedMaterial({
  color: 0xffffff,
  dashSize: 0.5,
  gapSize: 0.3,
  opacity: 0.5,
  transparent: true,
});
const pathLine = new THREE.Line(pathGeometry, pathMaterial);
pathLine.computeLineDistances(); // 计算虚线
scene.add(pathLine);

// 动画参数
let progress = 0;
const speed = 0.001;

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新飞机位置
  progress += speed;
  if (progress > 1) progress = 0;

  const point = curve.getPoint(progress);
  airplane.position.copy(point);

  // 计算飞机朝向
  const tangent = curve.getTangent(progress);
  const up = new THREE.Vector3(0, 1, 0);
  const matrix = new THREE.Matrix4();
  matrix.lookAt(new THREE.Vector3(0, 0, 0), tangent, up);
  airplane.quaternion.setFromRotationMatrix(matrix);

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
