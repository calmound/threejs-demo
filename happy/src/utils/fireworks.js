import * as THREE from "three";

/**
 * 单个烟花的类
 * 包含上升阶段和爆炸阶段两个状态
 */
class Firework {
  constructor(scene, position) {
    this.scene = scene;
    this.isExploded = false;
    this.trails = [];

    // 减小初始粒子大小
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: this.getRandomColor(),
      transparent: true,
      opacity: 1,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      4 + Math.random() * 2, // 增加上升速度
      (Math.random() - 0.5) * 0.5
    );

    scene.add(this.mesh);

    // 增加粒子数量到7000
    this.particleCount = 7000;
    this.particleGeometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = [];
    this.particleColors = new Float32Array(this.particleCount * 3);
    this.particleOpacities = new Float32Array(this.particleCount);
    this.particleSizes = new Float32Array(this.particleCount);
    this.particleLifetimes = new Float32Array(this.particleCount);
  }

  /**
   * 生成随机颜色
   * @returns {THREE.Color} 返回预定义的烟花颜色之一
   */
  getRandomColor() {
    const colors = [
      new THREE.Color(0xff0000), // 红色
      new THREE.Color(0x00ff00), // 绿色
      new THREE.Color(0x0000ff), // 蓝色
      new THREE.Color(0xff00ff), // 紫色
      new THREE.Color(0xffff00), // 黄色
      new THREE.Color(0x00ffff), // 青色
      new THREE.Color(0xff8c00), // 橙色
      new THREE.Color(0xff1493), // 粉色
      new THREE.Color(0x4169e1), // 宝蓝色
      new THREE.Color(0xffd700), // 金色
      new THREE.Color(0x00fa9a), // 翠绿色
      new THREE.Color(0x9400d3), // 紫罗兰
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 创建上升阶段的拖尾效果
   * 通过在烟花位置创建小球体实现
   */
  createTrail() {
    const trailGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: this.mesh.material.color,
      transparent: true,
      opacity: 0.6,
    });
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.position.copy(this.mesh.position);
    trail.userData.life = 0.5;
    this.trails.push(trail);
    this.scene.add(trail);
  }

  /**
   * 创建爆炸粒子的运动方向
   * @param {number} baseVelocity - 基础速度
   * @param {number} count - 粒子数量
   * @param {string} pattern - 爆炸模式："sphere"|"ring"|"willow"
   * @returns {Array<THREE.Vector3>} 返回粒子速度向量数组
   */
  createExplosionPattern(baseVelocity, count, pattern) {
    const velocities = [];
    switch (pattern) {
      case "sphere": // 球形爆炸模式
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          const velocity = new THREE.Vector3();
          velocity.x = Math.cos(theta) * Math.sin(phi);
          velocity.y = Math.sin(theta) * Math.sin(phi);
          velocity.z = Math.cos(phi);
          velocity.multiplyScalar(baseVelocity * (1 + Math.random())); // 增加爆炸速度
          velocities.push(velocity);
        }
        break;
      case "ring": // 环形爆炸模式
        const ringCount = Math.floor(count / 3);
        for (let ring = 0; ring < 3; ring++) {
          for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2;
            const velocity = new THREE.Vector3();
            velocity.x = Math.cos(angle);
            velocity.y = Math.sin(angle);
            velocity.z = (Math.random() - 0.5) * 0.2;
            velocity.multiplyScalar(baseVelocity * (0.8 + Math.random() * 0.4));
            velocity.y += 0.5; // Upward bias
            velocities.push(velocity);
          }
        }
        break;
      case "willow": // 柳树形爆炸模式
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = new THREE.Vector3();
          velocity.x = Math.cos(angle);
          velocity.y = Math.abs(Math.sin(angle)) * 2; // Stronger upward motion
          velocity.z = Math.sin(angle);
          velocity.multiplyScalar(baseVelocity * (0.5 + Math.random() * 0.5));
          velocities.push(velocity);
        }
        break;
    }
    return velocities;
  }

  /**
   * 烟花爆炸效果
   * 创建粒子系统并设置初始状态
   */
  explode() {
    const baseColor = this.getRandomColor();
    // 初始化粒子位置数组
    const positions = this.particlePositions;
    this.particleVelocities = [];

    // 设置每个粒子的初始位置和速度
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // 随机角度和半径，用于计算粒子扩散方向
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.PI;

      // 所有粒子初始位置都在爆炸点
      positions[i3] = this.mesh.position.x;
      positions[i3 + 1] = this.mesh.position.y;
      positions[i3 + 2] = this.mesh.position.z;

      // 优化粒子运动方向
      const phi = Math.acos(-1 + (2 * i) / this.particleCount);
      const theta = Math.sqrt(this.particleCount * Math.PI) * phi;

      const velocity = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(phi)
      );

      // 增加速度随机性
      velocity.multiplyScalar(2 + Math.random() * 3);
      this.particleVelocities.push(velocity);
    }

    // 创建粒子系统几何体
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    // 创建更炫丽的粒子材质
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      color: baseColor,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
    });

    // 添加发光效果
    particleMaterial.emissive = baseColor;
    particleMaterial.emissiveIntensity = 2;

    // 创建粒子系统并添加到场景
    this.particles = new THREE.Points(this.particleGeometry, particleMaterial);
    this.scene.add(this.particles);
    this.scene.remove(this.mesh); // 移除原始上升的烟花球体
    this.isExploded = true;

    // 为每个粒子设置不同的颜色
    const colors = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount; i++) {
      const color = this.getRandomColor();
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    this.particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
  }

  /**
   * 更新烟花状态
   * @returns {boolean} 返回烟花是否仍然存活
   */
  update() {
    if (!this.isExploded) {
      // 上升阶段的更新
      this.mesh.position.add(this.velocity);
      this.velocity.y -= 0.15; // 重力效果

      // 创建拖尾效果
      if (Math.random() < 0.3) {
        this.createTrail();
      }

      // 更新拖尾效果
      for (let i = this.trails.length - 1; i >= 0; i--) {
        const trail = this.trails[i];
        trail.userData.life -= 0.05;
        trail.material.opacity = trail.userData.life;

        if (trail.userData.life <= 0) {
          this.scene.remove(trail);
          this.trails.splice(i, 1);
        }
      }

      // 判断是否到达爆炸高度
      if (this.mesh.position.y < 20 && this.velocity.y < 0) {
        this.explode();
      }
    } else if (this.particles) {
      // 爆炸阶段的更新
      const positions = this.particleGeometry.attributes.position.array;
      let alive = false;

      // 更新所有粒子的位置
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        const velocity = this.particleVelocities[i];

        // 更新位置
        positions[i3] += velocity.x;
        positions[i3 + 1] += velocity.y;
        positions[i3 + 2] += velocity.z;

        // 应用重力
        velocity.y -= 0.08; // 调整重力
        // 空气阻力
        velocity.multiplyScalar(0.97); // 调整空气阻力
      }

      // 优化消失效果
      this.particles.material.opacity *= 0.985;
      this.particles.material.size *= 0.99;

      this.particleGeometry.attributes.position.needsUpdate = true;

      if (this.particles.material.opacity > 0.01) {
        alive = true;
      }

      // 移除已经消失的粒子系统
      if (!alive) {
        this.scene.remove(this.particles);
        this.particles = null;
      }

      return alive;
    }

    return this.trails.length > 0 || !this.isExploded;
  }
}

/**
 * 烟花管理器类
 * 负责创建和更新多个烟花实例
 */
export class FireworksManager {
  constructor(scene) {
    this.scene = scene;
    this.fireworks = [];
  }

  addFirework() {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      0,
      (Math.random() - 0.5) * 40
    );
    const firework = new Firework(this.scene, position);
    this.fireworks.push(firework);
  }

  update() {
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const isAlive = this.fireworks[i].update();
      if (!isAlive) {
        this.fireworks.splice(i, 1);
      }
    }
  }
}
