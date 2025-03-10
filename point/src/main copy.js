import "./style.css";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加 OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

// 设置基本参数
const distance = Math.min(100, window.innerWidth / 8);
const count = 2000;
const geometry = new THREE.BufferGeometry();
const vertices = [];

// 创建一个用于动画的状态对象
const animationState = {
  morphFactor: 0, // 0 表示立方体，1 表示球体
};

// 生成初始的立方体顶点
for (let i = 0; i < count; i++) {
  // 随机生成立方体的顶点
  const x = (Math.random() - 0.5) * 2 * distance;
  const y = (Math.random() - 0.5) * 2 * distance;
  const z = (Math.random() - 0.5) * 2 * distance;
  vertices.push(x, y, z);
}

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const particles = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({
    color: 0xff44ff,
    size: 2,
    sizeAttenuation: true,
  })
);

const renderingParent = new THREE.Group();
renderingParent.add(particles);

const resizeContainer = new THREE.Group();
resizeContainer.add(renderingParent);

scene.add(resizeContainer);
camera.position.z = 300;

// 创建一个函数来更新顶点位置
function updateVertices() {
  const positions = geometry.attributes.position.array;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // 获取立方体坐标
    const cubeX = (Math.random() - 0.5) * 2 * distance;
    const cubeY = (Math.random() - 0.5) * 2 * distance;
    const cubeZ = (Math.random() - 0.5) * 2 * distance;

    // 计算球体坐标
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const sphereX = distance * Math.cos(theta) * Math.sin(phi);
    const sphereY = distance * Math.sin(theta) * Math.sin(phi);
    const sphereZ = distance * Math.cos(phi);

    // 使用 morphFactor 进行插值
    positions[i3] = cubeX + (sphereX - cubeX) * animationState.morphFactor;
    positions[i3 + 1] = cubeY + (sphereY - cubeY) * animationState.morphFactor;
    positions[i3 + 2] = cubeZ + (sphereZ - cubeZ) * animationState.morphFactor;
  }

  geometry.attributes.position.needsUpdate = true;
}

const animate = function () {
  requestAnimationFrame(animate);
  controls.update();
  updateVertices();
  renderer.render(scene, camera);
};

animate();

// 创建形状变换动画
gsap.to(animationState, {
  morphFactor: 1,
  duration: 2,
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true,
  onUpdate: updateVertices,
});

// 缩放动画
const animProps = { scale: 1 };
gsap.to(animProps, {
  duration: 10,
  scale: 1.3,
  repeat: -1,
  yoyo: true,
  ease: "sine",
  onUpdate: () => {
    renderingParent.scale.set(
      animProps.scale,
      animProps.scale,
      animProps.scale
    );
  },
});
