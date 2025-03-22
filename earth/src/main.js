import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 3;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
document.querySelector('#app').appendChild(renderer.domElement);

// 后期处理效果
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 添加辉光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // 强度
  0.4,  // 半径
  0.85  // 阈值
);
composer.addPass(bloomPass);

// 创建控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 10;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enablePan = false;

// 创建光源
const ambientLight = new THREE.AmbientLight(0x101010, 1);
scene.add(ambientLight);

// 太阳光源（定向光）
const sunLight = new THREE.DirectionalLight(0x9999ff, 0.5);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

// 创建星空背景
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.02,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true
});

const starVertices = [];
for (let i = 0; i < 15000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// 加载纹理
const textureLoader = new THREE.TextureLoader();
const earthDayMap = textureLoader.load('/textures/earth_daymap.jpg');
const earthNormalMap = textureLoader.load('/textures/earth_normal.jpg');

// 创建自定义的夜间灯光纹理
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 512;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 生成城市灯光
const generateCityLights = () => {
  // 主要城市坐标（经纬度）
  const majorCities = [
    { lat: 40.7128, lng: -74.0060 }, // 纽约
    { lat: 34.0522, lng: -118.2437 }, // 洛杉矶
    { lat: 51.5074, lng: -0.1278 }, // 伦敦
    { lat: 48.8566, lng: 2.3522 }, // 巴黎
    { lat: 55.7558, lng: 37.6173 }, // 莫斯科
    { lat: 39.9042, lng: 116.4074 }, // 北京
    { lat: 35.6762, lng: 139.6503 }, // 东京
    { lat: 22.3193, lng: 114.1694 }, // 香港
    { lat: 1.3521, lng: 103.8198 }, // 新加坡
    { lat: -33.8688, lng: 151.2093 }, // 悉尼
    { lat: -23.5505, lng: -46.6333 }, // 圣保罗
    { lat: 19.4326, lng: -99.1332 }, // 墨西哥城
    { lat: 37.7749, lng: -122.4194 }, // 旧金山
    { lat: 41.8781, lng: -87.6298 }, // 芝加哥
    { lat: 25.2769, lng: 55.2962 }, // 迪拜
    { lat: 28.6139, lng: 77.2090 }, // 新德里
    { lat: 31.2304, lng: 121.4737 }, // 上海
    { lat: 23.1291, lng: 113.2644 }, // 广州
    { lat: 22.5726, lng: 88.3639 }, // 加尔各答
    { lat: 13.0827, lng: 80.2707 }, // 金奈
    { lat: 19.0760, lng: 72.8777 }, // 孟买
    { lat: 25.0330, lng: 121.5654 }, // 台北
    { lat: 37.5665, lng: 126.9780 }, // 首尔
    { lat: 14.5995, lng: 120.9842 }, // 马尼拉
    { lat: 3.1390, lng: 101.6869 }, // 吉隆坡
    { lat: 13.7563, lng: 100.5018 }, // 曼谷
    { lat: 21.0285, lng: 105.8542 }, // 河内
    { lat: 10.8231, lng: 106.6297 }, // 胡志明市
    { lat: -6.2088, lng: 106.8456 }, // 雅加达
    { lat: 30.0444, lng: 31.2357 }, // 开罗
    { lat: 6.5244, lng: 3.3792 }, // 拉各斯
    { lat: -1.2921, lng: 36.8219 }, // 内罗毕
    { lat: -33.9249, lng: 18.4241 }, // 开普敦
    { lat: 45.4215, lng: -75.6972 }, // 渥太华
    { lat: 53.3498, lng: -6.2603 }, // 都柏林
    { lat: 52.5200, lng: 13.4050 }, // 柏林
    { lat: 48.2082, lng: 16.3738 }, // 维也纳
    { lat: 47.3769, lng: 8.5417 }, // 苏黎世
    { lat: 41.9028, lng: 12.4964 }, // 罗马
    { lat: 40.4168, lng: -3.7038 }, // 马德里
    { lat: 59.3293, lng: 18.0686 }, // 斯德哥尔摩
    { lat: 55.6761, lng: 12.5683 }, // 哥本哈根
    { lat: 59.9139, lng: 10.7522 }, // 奥斯陆
    { lat: 60.1699, lng: 24.9384 }, // 赫尔辛基
  ];

  // 次要城市和小城镇（随机生成）
  const minorCities = [];
  for (let i = 0; i < 1000; i++) {
    const lat = (Math.random() * 180) - 90;
    const lng = (Math.random() * 360) - 180;
    minorCities.push({ lat, lng });
  }

  // 绘制主要城市灯光
  ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
  majorCities.forEach(city => {
    const x = ((city.lng + 180) / 360) * canvas.width;
    const y = ((90 - city.lat) / 180) * canvas.height;
    
    // 城市中心
    ctx.beginPath();
    ctx.arc(x, y, 3 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 城市光晕
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15 + Math.random() * 10);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 15 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 绘制次要城市灯光
  ctx.fillStyle = 'rgba(255, 255, 200, 0.5)';
  minorCities.forEach(city => {
    const x = ((city.lng + 180) / 360) * canvas.width;
    const y = ((90 - city.lat) / 180) * canvas.height;
    
    // 小城市光点
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 添加一些随机的小光点模拟小村庄
  ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // 跳过海洋区域（简化处理，实际应该使用地图数据）
    if (Math.random() > 0.7) {
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 添加一些连接线模拟交通网络
  ctx.strokeStyle = 'rgba(255, 255, 150, 0.2)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < majorCities.length - 1; i++) {
    if (Math.random() > 0.5) continue; // 只连接一部分城市
    
    const city1 = majorCities[i];
    const city2 = majorCities[(i + 1) % majorCities.length];
    
    const x1 = ((city1.lng + 180) / 360) * canvas.width;
    const y1 = ((90 - city1.lat) / 180) * canvas.height;
    const x2 = ((city2.lng + 180) / 360) * canvas.width;
    const y2 = ((90 - city2.lat) / 180) * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  return canvas;
};

// 生成夜间灯光纹理
const nightLightsCanvas = generateCityLights();
const nightLightsTexture = new THREE.CanvasTexture(nightLightsCanvas);

// 创建地球
const earthGeometry = new THREE.SphereGeometry(1, 128, 128);
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthDayMap,
  normalMap: earthNormalMap,
  normalScale: new THREE.Vector2(0.1, 0.1),
  shininess: 5,
  specular: new THREE.Color(0x333333),
  emissive: new THREE.Color(0x000000),
  emissiveMap: nightLightsTexture,
  emissiveIntensity: 1.5
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// 创建大气层
const atmosphereGeometry = new THREE.SphereGeometry(1.01, 128, 128);
const atmosphereMaterial = new THREE.MeshPhongMaterial({
  color: 0x0077be,
  transparent: true,
  opacity: 0.1,
  side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.scale.set(1.15, 1.15, 1.15);
scene.add(atmosphere);

// 创建光晕效果
const glowGeometry = new THREE.SphereGeometry(1.02, 128, 128);
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    c: { value: 0.2 },
    p: { value: 5.0 },
    glowColor: { value: new THREE.Color(0x0077be) },
    viewVector: { value: camera.position }
  },
  vertexShader: `
    uniform vec3 viewVector;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vNormel = normalize(normalMatrix * viewVector);
      intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() {
      vec3 glow = glowColor * c * pow(intensity, p);
      gl_FragColor = vec4(glow, 1.0);
    }
  `,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

// 添加信息面板
const infoPanel = document.createElement('div');
infoPanel.className = 'info-panel';
infoPanel.innerHTML = `
  <h3>夜间地球信息</h3>
  <p>这是一个使用Three.js创建的夜间地球模型，展示了城市灯火通明的景象。</p>
  <p>你可以使用鼠标拖动来旋转地球，滚轮缩放查看。</p>
  <p>点击下方按钮可以控制地球的各种效果。</p>
`;
document.body.appendChild(infoPanel);

// 加载动画
let loadingProgress = 0;
const loadingBar = document.querySelector('.loading-bar');
const loadingContainer = document.querySelector('.loading-container');

const updateLoadingProgress = () => {
  loadingProgress += Math.random() * 10;
  if (loadingProgress > 100) loadingProgress = 100;
  loadingBar.style.width = `${loadingProgress}%`;
  
  if (loadingProgress < 100) {
    setTimeout(updateLoadingProgress, 200);
  } else {
    setTimeout(() => {
      loadingContainer.style.opacity = '0';
      setTimeout(() => {
        loadingContainer.style.display = 'none';
      }, 1000);
    }, 500);
  }
};

updateLoadingProgress();

// 控制按钮功能
let isRotating = true;
const rotateBtn = document.getElementById('rotate-btn');
rotateBtn.addEventListener('click', () => {
  isRotating = !isRotating;
  controls.autoRotate = isRotating;
  rotateBtn.textContent = isRotating ? '暂停旋转' : '开始旋转';
});

const atmosphereBtn = document.getElementById('atmosphere-btn');
atmosphereBtn.addEventListener('click', () => {
  atmosphere.visible = !atmosphere.visible;
  atmosphereBtn.textContent = atmosphere.visible ? '关闭大气层' : '大气层效果';
});

// 添加更多控制按钮
const controlsContainer = document.querySelector('.controls');

// 辉光强度按钮
const bloomBtn = document.createElement('button');
bloomBtn.id = 'bloom-btn';
bloomBtn.className = 'control-btn';
bloomBtn.textContent = '增强辉光';
let isBloomEnhanced = false;
bloomBtn.addEventListener('click', () => {
  isBloomEnhanced = !isBloomEnhanced;
  bloomPass.strength = isBloomEnhanced ? 3.0 : 1.5;
  bloomBtn.textContent = isBloomEnhanced ? '减弱辉光' : '增强辉光';
});
controlsContainer.appendChild(bloomBtn);

const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', () => {
  gsap.to(camera.position, {
    duration: 1,
    x: 0,
    y: 0,
    z: 3,
    ease: 'power2.inOut'
  });
  gsap.to(controls.target, {
    duration: 1,
    x: 0,
    y: 0,
    z: 0,
    ease: 'power2.inOut',
    onUpdate: () => controls.update()
  });
});

// 窗口大小调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 动画循环
const clock = new THREE.Clock();

const animate = () => {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // 更新控制器
  controls.update();
  
  // 更新着色器uniforms
  glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
    camera.position,
    glow.position
  );
  
  // 添加闪烁效果
  if (Math.random() > 0.95) {
    const intensity = 1.5 + Math.random() * 0.5;
    gsap.to(earthMaterial, {
      duration: 0.2,
      emissiveIntensity: intensity,
      onComplete: () => {
        gsap.to(earthMaterial, {
          duration: 0.2,
          emissiveIntensity: 1.5
        });
      }
    });
  }
  
  // 渲染场景
  composer.render();
};

animate();
