import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 创建水晶球
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.9,
  thickness: 0.5,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// 创建雪花粒子系统
const snowflakeCount = 1000;
const snowflakeGeometry = new THREE.BufferGeometry();
const snowflakePositions = new Float32Array(snowflakeCount * 3);
const snowflakeSizes = new Float32Array(snowflakeCount);

for (let i = 0; i < snowflakeCount; i++) {
  const i3 = i * 3;
  // 在球体内部随机生成位置
  const radius = Math.random() * 1.8; // 略小于球体半径
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;

  snowflakePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  snowflakePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  snowflakePositions[i3 + 2] = radius * Math.cos(phi);

  snowflakeSizes[i] = Math.random() * 2 + 1;
}

snowflakeGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(snowflakePositions, 3)
);
snowflakeGeometry.setAttribute(
  "size",
  new THREE.BufferAttribute(snowflakeSizes, 1)
);

const snowflakeMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  opacity: 0.8,
  map: new THREE.TextureLoader().load(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKwSURBVFiF7ZdNSFRRFMd/580o2kynD0uKpg8qWkVBSRFR0SIIWrSJFhVFq6BV0LKoTUGbIFpUVLRpE5haFX1QEUEQRS2KiKKPTWQFWpqN4/R8t3lvXs28N2/eqAth/+DC5XLO/5z/u+/ccwcGMYhBDOI/h7Lxu5ThsAWHrQjqgBLgK4p3KDpxGc3GXzZABRyOoVQrcBBIAu+Ar0A5sB14CdyhmU5cXPJ+MwcqYHMNOIXLvD+HKqAOhzsYXCLBHK9PFVAG3EaxHZsZwDM0O9EsQ7MQzRbiPEbRgeIxmk40C4CNwEsU+73+VcBtFHuAz8AsFBfRjADOYvAYRQeaThJ0oZjuZXEBxXg0D4AeNLtxeQA0AiUoLqE5gUEbig4Uc4FbaEaieQR0o9mJy30ggeIYmqMkuI/iI/AUzRbP7xqa8SiuA9+BBpJ0oOhGsQeXe0ACxVE0R0hwD8VH4BmaLV4WV9GMR3MN+AHU49KOohvFXlzuAgaKY2iOkuAuio/AMzRbvf6X0YxHcxX4CdTj0o6iC8U+XO4ACRTHcThGgk4Un4DnaLZ5/S+iGY/mCvALqAO6UHSh2I/LLSCO4gQOx0nQgeIz8ALNdq//BTTj0VwGfgN1QBeKThQHcLkJxFGcwOE4CW6i+AK8RLPDy+IcmvFoLgG/gVqgG0UnihjQBsRRnMThBAluoPgKvEKz08viLJrxaC4Cv4BaoAdFJ4oDuNwA4ihO4nCSBNdRfAPeoNnl9T+DZjyaC8BPYDXQg6ITRQ3QBsRRnMLhJAmuofgOvEWz28viNJrxaFqBH8AqoAdFDEUNcB2IoziFw0kSXEXxA3iHpsrr34JmPJpW4DuwEuhBEUNRDVwD4ihO43CKBJ0ofgLv0ez1sjiFZjyaFuAb8D8FfwAGH03P8Sv3YQAAAABJRU5ErkJggg=="
  ),
  blending: THREE.AdditiveBlending,
  depthTest: false,
});

const snowflakes = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
scene.add(snowflakes);

// 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 处理窗口大小变化
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 雪花动画参数
const snowflakeVelocities = new Float32Array(snowflakeCount * 3);
for (let i = 0; i < snowflakeCount * 3; i += 3) {
  snowflakeVelocities[i] = (Math.random() - 0.5) * 0.01; // X方向速度
  snowflakeVelocities[i + 1] = -Math.random() * 0.01 - 0.005; // Y方向速度（向下）
  snowflakeVelocities[i + 2] = (Math.random() - 0.5) * 0.01; // Z方向速度
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新雪花位置
  const positions = snowflakeGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    // 更新位置
    positions[i] += snowflakeVelocities[i];
    positions[i + 1] += snowflakeVelocities[i + 1];
    positions[i + 2] += snowflakeVelocities[i + 2];

    // 检查是否超出球体范围
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const distance = Math.sqrt(x * x + y * y + z * z);

    if (distance > 1.8) {
      // 将雪花重置到球体顶部
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() * Math.PI) / 4; // 限制在顶部区域
      const radius = 1.8;

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.cos(phi);
      positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
  }
  snowflakeGeometry.attributes.position.needsUpdate = true;

  // 更新控制器
  controls.update();

  // 渲染场景
  renderer.render(scene, camera);
}

animate();
