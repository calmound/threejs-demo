import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// 表白语句数组
const confessions = [
  "你是我生命里的阳光",
  "遇见你是我最大的幸运",
  "每一天因为有你而变得特别",
  "你的笑容是我最爱的风景",
  "想和你一起数星星看月亮",
  "你是我心中最美的风景",
  "愿意为你写下最动人的诗句",
  "和你在一起的每一刻都很珍贵",
  "你就是我的整个世界",
  "想要和你一起走过春夏秋冬",
  "你的出现让我的生活充满色彩",
  "愿意陪你走过人生的每一步",
  "你是我最想珍惜的人",
  "想要给你最温暖的拥抱",
  "你的存在让我变得更好",
  "愿意为你付出所有的真心",
  "你是我心中最特别的那个人",
  "想要和你一起看遍世界的美景",
  "你的温柔是我最大的幸福",
  "愿意为你创造最浪漫的回忆",
  "你是我生命中最美好的礼物",
  "想要和你共度每个美好时光",
  "你的微笑是我最大的动力",
  "愿意为你编织最美的梦",
  "你是我心中永远的那道光",
  "想要和你一起创造美好未来",
  "你的爱让我感到无比幸福",
  "愿意陪你走过所有的风雨",
  "你是我最想守护的人",
  "想要和你一起写下我们的故事",
];

// 初始化场景、相机和渲染器
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // 设置背景颜色为黑色

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

// 创建三个不规则形状的平面
const shapes = [];
for (let j = 0; j < 3; j++) {
  const shape = new THREE.Shape();
  const segments = 12;
  const radius = 5;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
    const y = Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shapes.push(shape);
}

// 添加泡泡水波纹效果的shader
const bubbleVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bubbleFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  
  float noise(vec2 p) {
    return sin(p.x * 10.0) * sin(p.y * 10.0);
  }
  
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    
    // Create multiple layered ripples
    float ripple1 = sin(dist * 8.0 - time * 1.5) * 0.5 + 0.5;
    float ripple2 = sin(dist * 12.0 - time * 2.0 + 1.0) * 0.5 + 0.5;
    
    // Add some noise for organic movement
    float noiseVal = noise(uv + time * 0.5) * 0.1;
    
    // Combine ripples with noise
    float finalRipple = (ripple1 * 0.6 + ripple2 * 0.4 + noiseVal);
    
    // Smooth falloff at edges
    float alpha = smoothstep(1.0, 0.2, dist) * finalRipple * 0.4;
    
    // Purple-pink gradient with slight color variation
    vec3 color = mix(
      vec3(0.8, 0.4, 1.0),  // Purple
      vec3(1.0, 0.6, 0.8),  // Pink
      finalRipple
    );
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const bubbleUniforms = {
  time: { value: 0 },
};

// 创建泡泡效果材质
const bubbleMaterial = new THREE.ShaderMaterial({
  uniforms: bubbleUniforms,
  vertexShader: bubbleVertexShader,
  fragmentShader: bubbleFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
});

// 为每个文字创建泡泡平面
const bubbleGeometry = new THREE.PlaneGeometry(20, 20);
const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
bubble.position.z = -0.1; // 将泡泡放在文字后面

shapes.forEach((shape, index) => {
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff69b4,
    transparent: true,
    opacity: 0.3, // 增加透明度
    shininess: 100, // 增加光泽度
    side: THREE.DoubleSide,
  });

  // 创建边缘效果
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
    transparent: true,
    opacity: 0.5,
  });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

  const wall = new THREE.Mesh(geometry, material);
  wall.position.z = index * 3 - 3; // 设置每个平面的z轴位置
  wall.add(edges); // 添加边缘效果
  wall.add(bubble.clone()); // 添加泡泡效果
  scene.add(wall);
});

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// 添加 OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.maxPolarAngle = Math.PI * 0.6; // 限制垂直旋转角度
controls.minPolarAngle = Math.PI * 0.3;

// 创建文字对象数组
const textObjects = [];
const loader = new THREE.TextureLoader();

const fontLoader = new FontLoader();
let font;

fontLoader.load("./fonts/FangSong_Regular.json", (loadedFont) => {
  font = loadedFont;
  createTextObjects();
});

function createTextObjects() {
  confessions.forEach((text) => {
    const textMesh = createTextMesh(text);
    textObjects.push(textMesh);
    scene.add(textMesh);
  });
}

function createTextMesh(text) {
  const geometry = new TextGeometry(text, {
    font: font,
    size: 0.3, // 字体小一点
    height: 0.05, // 文字更细一些
    curveSegments: 12,
    bevelEnabled: false,
  });

  const material = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
  const mesh = new THREE.Mesh(geometry, material);

  // 随机位置
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 4;
  mesh.position.x = Math.cos(angle) * radius;
  mesh.position.y = Math.random() * 8 - 4;
  mesh.position.z = Math.floor(Math.random() * 3) * 3 - 3; // z轴与shape对应

  // 使文字竖直
  mesh.rotation.x = 0;

  return mesh;
}

// 设置相机位置
camera.position.z = 10;

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新 controls
  controls.update();

  // 文字向上移动
  textObjects.forEach((mesh) => {
    mesh.position.y += 0.01;
    if (mesh.position.y > 4) {
      mesh.position.y = -4;
    }

    // 添加轻微的水平摆动
    mesh.position.x += Math.sin(Date.now() * 0.001 + mesh.position.y) * 0.001;

    // 使文字竖直
    mesh.rotation.x = 0;
  });

  // 墙面轻微旋转
  // wall.rotation.z += 0.001;

  // 更新泡泡效果的时间
  bubbleUniforms.time.value = Date.now() * 0.001 * 0.5;

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
