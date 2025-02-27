/**
 * Three.js 行星演示项目
 *
 * 这个文件创建了一个3D行星场景，包含行星、光晕效果和粒子系统
 * 使用Three.js实现3D渲染和动画效果
 */

// 导入Three.js库和着色器文件
import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

/**
 * 渲染器初始化
 * 创建WebGL渲染器并设置基本属性
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 启用抗锯齿，使边缘更平滑
  alpha: true, // 启用透明背景
});
// 设置设备像素比，提高在高分辨率屏幕上的显示质量
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
// 设置渲染器尺寸为窗口大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 禁用自动清除，允许叠加渲染
renderer.autoClear = false;
// 设置清除颜色为黑色透明
renderer.setClearColor(0x000000, 0.0);
// 将渲染器的DOM元素添加到页面
document.body.appendChild(renderer.domElement);

/**
 * 场景初始化
 * 创建Three.js场景作为所有3D对象的容器
 */
const scene = new THREE.Scene();

/**
 * 相机初始化
 * 创建透视相机并设置位置
 */
const camera = new THREE.PerspectiveCamera(
  75, // 视场角度
  window.innerWidth / window.innerHeight, // 宽高比
  1, // 近裁剪面
  1000 // 远裁剪面
);
// 设置相机位置
camera.position.z = 400;
// 将相机添加到场景
scene.add(camera);

/**
 * 创建主要3D对象
 * 这些对象将用于组织场景中的不同元素
 */
const circle = new THREE.Object3D(); // 行星对象
const particle = new THREE.Object3D(); // 粒子系统对象
const halo = new THREE.Object3D(); // 光晕对象
const luminor = new THREE.Object3D(); // 光源对象
const lights = []; // 光源数组

// 将主要对象添加到场景
scene.add(circle);
scene.add(particle);
scene.add(halo);
scene.add(luminor);

/**
 * 几何体定义
 * 创建场景中使用的各种几何形状
 */
// 四面体几何体，用于创建粒子
const geometry = new THREE.TetrahedronGeometry(1, 1);
// 球体几何体，用于创建行星
const geo_planet = new THREE.SphereGeometry(10, 64, 32);
// 球体几何体，用于创建光晕
const geom3 = new THREE.SphereGeometry(16, 32, 16);

/**
 * 粒子材质定义
 * 创建用于粒子的材质
 */
const material = new THREE.MeshPhongMaterial({
  color: 0x111111, // 暗灰色
  shading: THREE.FlatShading, // 平面着色
});

/**
 * 创建粒子系统
 * 生成多个随机分布的粒子，形成星空背景
 */
for (let i = 0; i < 500; i++) {
  // 创建粒子网格
  const mesh = new THREE.Mesh(geometry, material);
  // 随机设置位置方向
  mesh.position
    .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
    .normalize();
  // 随机设置距离
  mesh.position.multiplyScalar(200 + Math.random() * 500);
  // 随机设置旋转
  mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
  // 添加到粒子系统
  particle.add(mesh);
}

/**
 * 行星材质定义
 * 创建具有纹理和光照效果的行星材质
 */
const mat = new THREE.MeshPhongMaterial({
  color: 0x000000, // 基础颜色
  emissive: 0x000000, // 自发光颜色
  // 加载行星表面纹理
  map: new THREE.TextureLoader().load("/map.jpg"),
  // 加载凹凸贴图，增加表面细节
  bumpMap: new THREE.TextureLoader().load("/map.jpg"),
  bumpScale: 0.025, // 凹凸效果强度
  // 加载高光贴图
  specularMap: new THREE.TextureLoader().load("/map.jpg"),
  specular: new THREE.Color("grey"), // 高光颜色
  shininess: 3, // 高光强度
});

/**
 * 光晕材质定义
 * 使用自定义着色器创建行星周围的光晕效果
 */
const mat3 = new THREE.ShaderMaterial({
  uniforms: {}, // 着色器统一变量
  vertexShader: vertexShader, // 顶点着色器
  fragmentShader: fragmentShader, // 片段着色器
  side: THREE.BackSide, // 渲染背面
  blending: THREE.AdditiveBlending, // 加法混合模式
  transparent: true, // 启用透明
  opacity: 1.5, // 不透明度
  depthWrite: false, // 禁用深度写入，使光晕始终可见
});

/**
 * 创建行星
 * 使用球体几何体和行星材质创建行星
 */
const planet = new THREE.Mesh(geo_planet, mat);
// 设置行星大小
planet.scale.x = planet.scale.y = planet.scale.z = 15;
// 添加到行星容器
circle.add(planet);

/**
 * 创建光晕效果
 * 使用自定义着色器材质创建行星周围的光晕
 */
// 创建主光晕
const ball = new THREE.Mesh(geom3, mat3);
// 设置光晕大小
ball.scale.x = ball.scale.y = ball.scale.z = 16;
// 添加到光晕容器
halo.add(ball);

// 创建次级光晕
const ball2 = new THREE.Mesh(geom3, mat3);
// 设置次级光晕大小
ball2.scale.x = ball2.scale.y = ball2.scale.z = 12;
// 设置次级光晕位置
ball2.position.set(25, 5, 1);
// 添加到光晕容器
halo.add(ball2);

/**
 * 添加光源
 * 创建多种光源以实现复杂的光照效果
 */
// 环境光 - 提供基础照明
const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

// 半球光 - 模拟天空和地面反射的光线
const hemiLight = new THREE.HemisphereLight(0x777777, 0x222222, 15);
hemiLight.position.set(-1, -1, 2);
luminor.add(hemiLight);

// 定向光1 - 模拟主光源
lights[1] = new THREE.DirectionalLight(0x999999, 4);
lights[1].position.set(-1, 0, 0.5);
// 定向光2 - 模拟次级光源
lights[2] = new THREE.DirectionalLight(0x999999, 4);
lights[2].position.set(1, 0, 0.5);

// 将光源添加到场景
scene.add(lights[1]);
scene.add(lights[2]);

/**
 * 窗口大小调整处理
 * 监听窗口大小变化并更新渲染尺寸
 */
window.addEventListener("resize", onWindowResize, false);

/**
 * 窗口大小变化处理函数
 * 更新相机和渲染器以适应新的窗口尺寸
 */
function onWindowResize() {
  // 更新相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器尺寸
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 动画循环函数
 * 实现场景中各元素的动画效果并渲染场景
 */
function animate() {
  // 请求下一帧动画
  requestAnimationFrame(animate);

  // 粒子系统旋转
  particle.rotation.y -= 0.004;
  // 行星旋转
  circle.rotation.x -= 0.001;
  circle.rotation.y -= 0.001;
  // 光晕旋转
  halo.rotation.z -= 0.005;
  luminor.rotation.z -= 0.005;

  // 清除渲染器
  renderer.clear();
  // 渲染场景
  renderer.render(scene, camera);
}

// 开始动画循环
animate();
