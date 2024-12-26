import * as THREE from "three";

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 相机位置
camera.position.z = 50;

// 烟花粒子类
class Firework {
  constructor(x, y, z) {
    this.particles = [];
    this.geometry = new THREE.BufferGeometry();
    this.count = 10000;
    this.positions = new Float32Array(this.count * 3);
    this.velocities = [];
    this.colors = new Float32Array(this.count * 3);
    this.sizes = new Float32Array(this.count);
    this.life = new Float32Array(this.count);

    // 初始化粒子
    for (let i = 0; i < this.count; i++) {
      // 随机球面分布
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const velocity = 2 + Math.random() * 2;

      this.velocities.push(
        velocity * Math.sin(theta) * Math.cos(phi),
        velocity * Math.sin(theta) * Math.sin(phi),
        velocity * Math.cos(theta)
      );

      // 设置初始位置
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;

      // 设置为红色，添加一些随机变化使其更自然
      this.colors[i * 3] = 1.0;
      this.colors[i * 3 + 1] = Math.random() * 0.2;
      this.colors[i * 3 + 2] = Math.random() * 0.2;

      // 粒子大小和生命周期
      this.sizes[i] = 0.3;
      this.life[i] = 1.0;
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.colors, 3)
    );
    this.geometry.setAttribute(
      "size",
      new THREE.BufferAttribute(this.sizes, 1)
    );

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });

    this.points = new THREE.Points(this.geometry, material);
    scene.add(this.points);
  }

  update() {
    let alive = false;
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] > 0) {
        alive = true;
        // 更新位置
        this.positions[i * 3] += this.velocities[i * 3] * 0.1;
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * 0.1;
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * 0.1;

        // 添加重力效果
        this.velocities[i * 3 + 1] -= 0.05;

        // 更新生命周期
        this.life[i] -= 0.015;
        this.sizes[i] = this.life[i] * 0.3;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    return alive;
  }

  dispose() {
    scene.remove(this.points);
    this.geometry.dispose();
    this.points.material.dispose();
  }
}

// 存储所有活跃的烟花
const fireworks = [];

// 随机生成烟花位置
function createRandomFirework() {
  const x = (Math.random() * 2 - 1) * 30;
  const y = (Math.random() * 2 - 1) * 25;
  fireworks.push(new Firework(x, y, 0));
}

// 窗口大小调整处理
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 随机生成烟花
  if (Math.random() < 0.05) {
    createRandomFirework();
  }

  // 更新所有烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const alive = fireworks[i].update();
    if (!alive) {
      fireworks[i].dispose();
      fireworks.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// 事件监听
window.addEventListener("resize", onWindowResize, false);

// 启动动画
animate();
