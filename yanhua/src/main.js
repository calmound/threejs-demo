// 导入 Three.js 库
import * as THREE from "three";

// 初始化场景、相机和渲染器
const scene = new THREE.Scene();
// 设置透视相机：视野角度75度，宽高比自适应屏幕，近裁剪面0.1，远裁剪面1000
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 创建渲染器，启用抗锯齿
const renderer = new THREE.WebGLRenderer({ antialias: true });
// 设置渲染器尺寸为窗口大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将渲染器的画布添加到页面
document.body.appendChild(renderer.domElement);

// 设置相机位置，距离z轴50个单位
camera.position.z = 50;

/**
 * 烟花粒子类
 * 负责创建和管理单个烟花的所有粒子
 */
class Firework {
  constructor(x, y, z) {
    // 初始化属性
    this.particles = []; // 粒子数组
    this.geometry = new THREE.BufferGeometry(); // 粒子几何体
    this.count = 10000; // 粒子数量
    this.positions = new Float32Array(this.count * 3); // 粒子位置数组
    this.velocities = []; // 粒子速度数组
    this.colors = new Float32Array(this.count * 3); // 粒子颜色数组
    this.sizes = new Float32Array(this.count); // 粒子大小数组
    this.life = new Float32Array(this.count); // 粒子生命周期数组

    // 初始化每个粒子
    for (let i = 0; i < this.count; i++) {
      // 使用球面坐标系计算粒子初始方向
      const phi = Math.random() * Math.PI * 2; // 水平角度
      const theta = Math.random() * Math.PI; // 垂直角度
      const velocity = 2 + Math.random() * 2; // 随机速度

      // 计算粒子速度向量
      this.velocities.push(
        velocity * Math.sin(theta) * Math.cos(phi), // x方向速度
        velocity * Math.sin(theta) * Math.sin(phi), // y方向速度
        velocity * Math.cos(theta) // z方向速度
      );

      // 设置粒子初始位置
      this.positions[i * 3] = x; // x坐标
      this.positions[i * 3 + 1] = y; // y坐标
      this.positions[i * 3 + 2] = z; // z坐标

      // 设置粒子颜色（红色为主，带随机变化）
      this.colors[i * 3] = 1.0; // 红色通道
      this.colors[i * 3 + 1] = Math.random() * 0.2; // 绿色通道
      this.colors[i * 3 + 2] = Math.random() * 0.2; // 蓝色通道

      // 初始化粒子大小和生命值
      this.sizes[i] = 0.3; // 初始大小
      this.life[i] = 1.0; // 初始生命值
    }

    // 设置几何体属性
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

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: 0.3, // 粒子大小
      vertexColors: true, // 启用顶点颜色
      blending: THREE.AdditiveBlending, // 使用加法混合
      transparent: true, // 启用透明
      opacity: 0.8, // 设置透明度
    });

    // 创建粒子系统并添加到场景
    this.points = new THREE.Points(this.geometry, material);
    scene.add(this.points);
  }

  // 更新烟花状态
  update() {
    let alive = false;
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] > 0) {
        alive = true;
        // 根据速度更新位置
        this.positions[i * 3] += this.velocities[i * 3] * 0.1;
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * 0.1;
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * 0.1;

        // 添加重力效果
        this.velocities[i * 3 + 1] -= 0.05;

        // 更新生命值和大小
        this.life[i] -= 0.015;
        this.sizes[i] = this.life[i] * 0.3;
      }
    }

    // 标记属性需要更新
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    return alive; // 返回是否还有活着的粒子
  }

  // 清理烟花资源
  dispose() {
    scene.remove(this.points); // 从场景中移除
    this.geometry.dispose(); // 释放几何体
    this.points.material.dispose(); // 释放材质
  }
}

// 存储所有活跃的烟花实例
const fireworks = [];

/**
 * 创建随机位置的烟花
 * 在场景的合理范围内随机选择位置
 */
function createRandomFirework() {
  const x = (Math.random() * 2 - 1) * 30; // x范围：-30到30
  const y = (Math.random() * 2 - 1) * 25; // y范围：-25到25
  fireworks.push(new Firework(x, y, 0));
}

/**
 * 窗口大小改变时的处理函数
 * 更新相机和渲染器以适应新的窗口尺寸
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 动画循环函数
 * 负责更新和渲染场景
 */
function animate() {
  requestAnimationFrame(animate);

  // 有5%的概率生成新烟花
  if (Math.random() < 0.05) {
    createRandomFirework();
  }

  // 更新所有烟花，移除已经消失的烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const alive = fireworks[i].update();
    if (!alive) {
      fireworks[i].dispose();
      fireworks.splice(i, 1);
    }
  }

  // 渲染场景
  renderer.render(scene, camera);
}

// 监听窗口大小变化
window.addEventListener("resize", onWindowResize, false);

// 开始动画循环
animate();
