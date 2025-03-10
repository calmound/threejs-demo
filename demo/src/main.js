// 导入Three.js核心库和相关扩展
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // 用于相机轨道控制
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"; // 后期处理合成器
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"; // 渲染通道
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js"; // 着色器通道
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"; // 辉光效果通道
import { GammaCorrectionShader } from "three/addons/shaders/GammaCorrectionShader.js"; // 伽马校正着色器

//---------- 场景初始化 ----------//

// 创建主场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // 设置深灰色背景
scene.fog = new THREE.Fog(0x050505, 10, 50); // 添加雾效果，增加深度感

// 创建相机
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5; // 设置相机位置

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true }); // 抗锯齿
renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染尺寸为窗口大小
renderer.setPixelRatio(window.devicePixelRatio); // 适配高分辨率屏幕
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 设置色调映射
renderer.toneMappingExposure = 1; // 设置曝光度
document.getElementById("container").appendChild(renderer.domElement); // 将渲染器添加到HTML容器中

//---------- 运动轨迹效果初始化 ----------//

// 创建轨迹场景 - 用于实现粒子运动轨迹效果
const trailScene = new THREE.Scene(); // 创建单独的场景用于轨迹效果
const trailCamera = camera.clone(); // 复制主相机
// 创建渲染目标纹理，用于存储上一帧的渲染结果
const trailTexture = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    minFilter: THREE.LinearFilter, // 缩小滤镜
    magFilter: THREE.LinearFilter, // 放大滤镜
    format: THREE.RGBAFormat, // 使用RGBA格式
  }
);

//---------- 光照设置 ----------//

// 添加环境光 - 提供整体柔和照明
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.7 // 环境光强度
);
scene.add(ambientLight);

// 添加平行光 - 提供方向性照明和阴影
const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  1 // 平行光强度
);
directionalLight.position.set(1, 3, 2); // 设置光源位置
directionalLight.castShadow = true; // 启用阴影投射
scene.add(directionalLight);

//---------- 后期处理设置 ----------//

// 创建主效果合成器
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera); // 创建渲染通道
composer.addPass(renderPass); // 添加到合成器

// 添加辉光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), // 尺寸
  0.8, // 辉光强度
  0.5, // 辉光半径
  0.85 // 辉光阈值
);
composer.addPass(bloomPass); // 添加到合成器

// 添加伽马校正 - 确保颜色正确显示
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaCorrectionPass); // 添加到合成器

// 创建轨迹效果合成器
const trailComposer = new EffectComposer(renderer, trailTexture);
const trailRenderPass = new RenderPass(trailScene, trailCamera);
trailComposer.addPass(trailRenderPass); // 添加到轨迹合成器

//---------- 相机控制器设置 ----------//

// 创建轨道控制器 - 允许用户旋转和缩放场景
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 启用阻尼效果，使控制更平滑
controls.dampingFactor = 0.1; // 设置阻尼系数
controls.rotateSpeed = 0.5; // 设置旋转速度
controls.minDistance = 2; // 设置最小缩放距离
controls.maxDistance = 10; // 设置最大缩放距离

// 添加鼠标交互的光标样式变化
controls.addEventListener("start", () => {
  document.body.style.cursor = "grabbing"; // 抓取状态
});

controls.addEventListener("end", () => {
  document.body.style.cursor = "grab"; // 可抓取状态
});

//---------- 粒子系统创建 ----------//

// 粒子数量
const numParticles = 25000;

// 创建粒子几何体
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(numParticles * 3); // 位置数组 (x,y,z) * 粒子数量
const colors = new Float32Array(numParticles * 3); // 颜色数组 (r,g,b) * 粒子数量
const sizes = new Float32Array(numParticles); // 大小数组

// 使用球坐标算法分布粒子，确保均匀覆盖球体表面
for (let i = 0; i < numParticles; i++) {
  // 球坐标计算
  const phi = Math.acos(-1 + (2 * i) / numParticles); // 天顶角
  const theta = Math.sqrt(numParticles * Math.PI) * phi; // 方位角

  // 转换为笛卡尔坐标
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.sin(phi) * Math.sin(theta);
  const z = Math.cos(phi);

  // 设置粒子位置，乘以1.5缩放球体大小
  positions[i * 3] = x * 1.5;
  positions[i * 3 + 1] = y * 1.5;
  positions[i * 3 + 2] = z * 1.5;

  // 设置粒子颜色，基于基础颜色添加随机亮度变化
  const color = new THREE.Color(0xff5900); // 粒子颜色 (橙色)
  color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.5); // 随机调整亮度
  colors[i * 3] = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;

  // 设置粒子大小，添加随机变化
  sizes[i] = 0.035 * (0.8 + Math.random() * 0.4); // 粒子大小
}

// 将数据添加到几何体
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

// 创建粒子材质
const material = new THREE.PointsMaterial({
  size: 0.035, // 粒子大小
  vertexColors: true, // 使用顶点颜色
  blending: THREE.AdditiveBlending, // 加法混合模式，使重叠粒子更亮
  depthTest: true, // 启用深度测试
  depthWrite: false, // 禁用深度写入，避免遮挡问题
  transparent: true, // 启用透明
  opacity: 0.9, // 设置不透明度
  sizeAttenuation: true, // 启用大小衰减，远处粒子更小
});

// 创建粒子系统并添加到场景
const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// 为轨迹效果创建粒子系统副本
const trailParticles = particleSystem.clone();
trailScene.add(trailParticles);

//---------- 轨迹效果着色器 ----------//

// 创建轨迹效果的着色器材质
const trailMaterial = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null }, // 将在渲染时设置为上一帧的渲染结果
    opacity: { value: 0.3 }, // 轨迹不透明度 (运动轨迹效果强度)
  },
  // 顶点着色器 - 处理顶点位置
  vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;  // 传递纹理坐标
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  // 片段着色器 - 处理像素颜色
  fragmentShader: `
        uniform sampler2D tDiffuse;  // 输入纹理
        uniform float opacity;       // 不透明度
        varying vec2 vUv;            // 从顶点着色器接收的纹理坐标
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);  // 采样纹理
            gl_FragColor = opacity * texel;         // 应用不透明度
        }
    `,
});

// 创建轨迹效果通道并添加到合成器
const trailPass = new ShaderPass(trailMaterial);
trailPass.renderToScreen = true; // 设置为直接渲染到屏幕
composer.addPass(trailPass);

//---------- 事件监听器 ----------//

// 窗口大小变化事件 - 调整渲染尺寸
window.addEventListener(
  "resize",
  () => {
    // 更新相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // 更新渲染器尺寸
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 更新后期处理效果尺寸
    composer.setSize(window.innerWidth, window.innerHeight);
    trailTexture.setSize(window.innerWidth, window.innerHeight);
    trailComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

// 双击事件 - 重置相机位置和控制器
renderer.domElement.addEventListener("dblclick", () => {
  camera.position.set(0, 0, 5); // 重置相机位置
  camera.lookAt(0, 0, 0); // 重置相机朝向
  controls.reset(); // 重置控制器
});

//---------- 动画循环 ----------//

// 用于计算动画时间差
const clock = new THREE.Clock();

// 动画函数 - 每帧调用
function animate() {
  requestAnimationFrame(animate); // 请求下一帧动画

  const delta = clock.getDelta(); // 获取时间差，用于平滑动画

  // 旋转粒子系统
  if (particleSystem) {
    particleSystem.rotation.y += delta * 0.1; // 旋转速度
  }

  // 渲染轨迹效果
  renderer.setRenderTarget(trailTexture); // 设置渲染目标为轨迹纹理
  renderer.render(scene, camera); // 渲染场景
  renderer.setRenderTarget(null); // 重置渲染目标

  // 更新控制器和渲染最终效果
  controls.update(); // 更新轨道控制器
  composer.render(); // 使用效果合成器渲染
}

// 开始动画循环
animate();
