import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import "./style.css";
// 场景
const scene = new THREE.Scene();

// 相机：视角设置为 75 度，近裁剪面 0.1，远裁剪面 1000
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 0); // 将相机位置设置在中心点

// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建球体并设置纹理
const geometry = new THREE.SphereGeometry(500, 60, 40); // 球体半径 500，60 段宽度，40 段高度
geometry.scale(-1, 1, 1); // 将球体反向，使得相机在球体内部

// 加载全景图纹理
const texture = new EXRLoader().load("hotel_room_4k.exr");

// 创建材质并将纹理应用到球体
const material = new THREE.MeshBasicMaterial({ map: texture });

// 创建球体并加入场景
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 初始角度
let lon = 0,
  lat = 0;
let isUserInteracting = false;
let onPointerDownPointerX = 0,
  onPointerDownPointerY = 0, // 新增Y轴坐标记录
  onPointerDownLon = 0,
  onPointerDownLat = 0;

// 鼠标按下事件
document.addEventListener("pointerdown", (event) => {
  isUserInteracting = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY; // 记录初始Y轴位置
  onPointerDownLon = lon;
  onPointerDownLat = lat;
});

// 鼠标移动事件
document.addEventListener("pointermove", (event) => {
  if (isUserInteracting) {
    lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
    lat = (onPointerDownPointerY - event.clientY) * 0.1 + onPointerDownLat; // 修正lat的计算方式
  }
});

// 鼠标松开事件
document.addEventListener("pointerup", () => {
  isUserInteracting = false;
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 限制角度范围，防止旋转过度
  lat = Math.max(-85, Math.min(85, lat)); // 只限制lat的范围

  const phi = THREE.MathUtils.degToRad(90 - lat); // 使用 Three.js 的角度转弧度方法
  const theta = THREE.MathUtils.degToRad(lon);

  // 计算相机的朝向
  const lookAtX = 500 * Math.sin(phi) * Math.cos(theta);
  const lookAtY = 500 * Math.cos(phi);
  const lookAtZ = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(lookAtX, lookAtY, lookAtZ);

  renderer.render(scene, camera);
}

// 启动动画
animate();

// 窗口大小调整事件
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
